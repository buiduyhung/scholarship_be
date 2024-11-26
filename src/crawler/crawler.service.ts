import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import puppeteer from 'puppeteer';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import {
  CrawData,
  CrawDataDocument,
} from 'src/crawler/schema/craw-data.schema';
import {
  CrawSchedule,
  CrawScheduleDocument,
} from 'src/crawler/schema/craw-schedule.schema';
import { IUser } from 'src/users/users.interface';

@Injectable()
export class CrawlerService {
  private readonly logger: Logger;
  constructor(
    @InjectModel(CrawData.name)
    private crawDataModel: SoftDeleteModel<CrawDataDocument>,
    @InjectModel(CrawSchedule.name)
    private crawScheduleModel: SoftDeleteModel<CrawScheduleDocument>,
  ) {
    this.logger = new Logger(CrawlerService.name);
  }

  @Cron(CronExpression.EVERY_WEEKEND)
  async crawlIPD() {
    const schedule = await this.crawScheduleModel
      .findOne({
        name: 'IDP',
      })
      .exec();
    this.logger.debug('Start crawling scholarship listings from IDP');
    const browser = await puppeteer
      .launch({
        // env: { DBUS_SESSION_BUS_ADDRESS: process.env.DBUS_SESSION_BUS_ADDRESS },
        // executablePath: '/usr/bin/google-chrome',
        headless: true,
        defaultViewport: null,
        args: [
          '--start-maximized',
          '--no-sandbox',
          '--use-gl=egl',
          '--disable-setuid-sandbox',
        ],
        ignoreDefaultArgs: ['--disable-extensions'],
      })
      .catch((e) => {
        console.error('Error while connecting to browser:', e);
        throw e;
      })
      .then((b) => {
        return b;
      });
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    );
    try {
      const baseURL = 'https://www.idp.com';
      await page.goto(`${baseURL}/find-a-scholarship/?subject=all-subject`);
      const total = parseInt(
        (
          await page.$eval(
            '#scholarship-listing-banner > section > p',
            (node) => node.textContent,
          )
        ).split(' ')[1],
      );
      // Get the titles of the first 10 job listings
      const scholarshipCardSelector =
        '#root > div:nth-child(4) > div > div:nth-child(3) > section > div > div.mt-\\[28px\\].c-lg\\:mt-\\[40px\\].grid.grid-cols-1.c-md\\:grid-cols-2.c-xl\\:grid-cols-3.gap-\\[12px\\].c-lg\\:gap-x-\\[24px\\].c-lg\\:gap-y-\\[28px\\] > div';

      // STEP 2: Get the total number of scholarships, and calculate the number of pages
      // For each craw, we only crawl schedule.takePerCraw pages
      // For IDP, each page has 12 scholarships
      const pages = Math.ceil(total / 12);
      this.logger.debug(`Total scholarships: ${total}`);
      this.logger.debug(`Total pages: ${pages}`);
      const { lastPage, takePerCraw, lastTotal } = schedule;

      if (lastTotal === total) {
        this.logger.debug('No new scholarships');
        return;
      }

      // STEP 3: Get the links to the scholarship details page, start from page lastPage to page lastPage + takePerCraw
      const scholarshipSummariesLinks = Array.from({
        length: takePerCraw,
      }).map((_, page) => {
        return `${baseURL}/find-a-scholarship/?subject=all-subject&page=${lastPage + page + 1
          }`;
      });

      // STEP 4: Go to each scholarship details page and scrape the details
      this.logger.debug('Gethering scholarship links by pagination');
      const scholarshipSummariesPromise = scholarshipSummariesLinks.map(
        async (link) => {
          const page = await browser.newPage();
          this.logger.debug(`Navigating to: ${link}`);
          await page.goto(link);
          const scholarshipSummaries = await page.$$eval(
            scholarshipCardSelector,
            (nodes) =>
              nodes.map((node) => {
                const title = node.querySelector('a').textContent;
                const href = node.querySelector('a').getAttribute('href');
                const university = node.querySelector('p').textContent;

                return {
                  title,
                  href,
                  description: university,
                };
              }),
          );
          page.close();
          this.logger.debug(
            `Found ${scholarshipSummaries.length} scholarships`,
          );
          return scholarshipSummaries;
        },
      );
      const scholarshipSummaries = await Promise.all(
        scholarshipSummariesPromise,
      ).then((data) => {
        return data.flat();
      });

      const scrapePromises = scholarshipSummaries.map(
        async (scholarshipSummary) => {
          // go to the job listing page
          this.logger.log(`\n\nScrapping: ${scholarshipSummary.title}`);
          const detailsPage = await browser.newPage();
          await detailsPage
            .goto(`${baseURL}${scholarshipSummary.href}`)
            .catch((e) => {
              this.logger.error(
                `Error while navigating to ${baseURL}${scholarshipSummary.href}`,
                e,
              );
            });
          const meta = await detailsPage.$$eval(
            `#scholarship-detail-accordion div.c-md\\:w-\\[48\\%\\].w-full`,
            (nodes) => {
              return nodes.map((node) => {
                if (
                  !node.querySelector('p:nth-child(1)') ||
                  !node.querySelector('p:nth-child(2)')
                ) {
                  return;
                }
                const label = node.querySelector('p:nth-child(1)').textContent;
                // value could be p or a
                let value = node.querySelector('p:nth-child(2)').textContent;
                if (!value) {
                  value = node.querySelector('a').textContent;
                }
                return {
                  label,
                  value,
                };
              });
            },
          );

          const descriptions = await detailsPage.$$eval(
            '#scholarship-detail-accordion > div > div.grid.grid-cols-1.c-lg\\:grid-cols-4 > div.c-lg\\:col-span-3.px-\\[16px\\].c-xs\\:px-\\[24px\\].c-xl2\\:px-0 > div > div > div > p.text-grey-darkest',
            (node) => {
              return node.map((n) => n.innerHTML);
            },
          );

          scholarshipSummary['meta'] = meta.filter((m) => m);
          scholarshipSummary['description'] = descriptions.join('\n');
          scholarshipSummary['schedule'] = schedule;
          scholarshipSummary['href'] = `${baseURL}${scholarshipSummary.href}`;
          detailsPage.close();
          return scholarshipSummary;
        },
      );

      const data = await Promise.all(scrapePromises);

      // STEP 5: Save the data to the database
      this.logger.debug('Saving scholarships to the database');
      await this.crawDataModel.insertMany(data);

      // STEP 6: Update the lastPage in the schedule
      await this.crawScheduleModel.updateOne(
        { name: 'IDP' },
        {
          lastPage: lastPage + takePerCraw,
          lastTotal: lastTotal + data.length,
        },
      );

      return {
        meta: {
          total,
          pages,
        },
        result: data, //kết quả query
      };
    } catch (error) {
      console.error('Error while scraping job listings:', error);
    } finally {
      await browser.close();
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;

    // Query tổng số bản ghi
    const totalItems = await this.crawDataModel.countDocuments(filter);

    // Tính tổng số trang
    const totalPages = Math.ceil(totalItems / defaultLimit);

    // Thực hiện query học bổng
    const result = await this.crawDataModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort({ createdAt: -1 })
      .populate(population)
      .select(projection as any)
      .exec();

    return {
      meta: {
        current: currentPage, // Trang hiện tại
        pageSize: limit, // Số bản ghi mỗi trang
        pages: totalPages, // Tổng số trang
        total: totalItems, // Tổng số bản ghi
      },
      result, // Kết quả trả về
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return `not found scholarship`;
    }
    return await this.crawDataModel.findById(id);
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) return `not found crawler data`;
    await this.crawDataModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return this.crawDataModel.softDelete({
      _id: id,
    });
  }
}
