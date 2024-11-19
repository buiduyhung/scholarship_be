import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';

@Injectable()
export class CrawlerService {
  private readonly logger: Logger;
  constructor() {
    this.logger = new Logger(CrawlerService.name);
  }
  async crawl() {
    this.logger.debug('Start crawling scholarship listings from IDP');
    const browser = await puppeteer
      .launch({
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
      const pages = Math.ceil(total / 12);
      this.logger.debug(`Total scholarships: ${total}`);
      this.logger.debug(`Total pages: ${pages}`);
      // Get the titles of the first 10 job listings
      const scholarshipGridSelector =
        '#root > div:nth-child(5) > div > div:nth-child(3) > section > div > div[class="mt-[28px] c-lg:mt-[40px] grid grid-cols-1 c-md:grid-cols-2 c-xl:grid-cols-3 gap-[12px] c-lg:gap-x-[24px] c-lg:gap-y-[28px]"] > div';
      // TODO: THIS HAS BEEN LIMITED TO 1 PAGE FOR TESTING
      const scholarshipSummariesLinks = Array.from({
        // length: pages,
        length: 1,
      }).map((_, page) => {
        return `${baseURL}/find-a-scholarship/?subject=all-subject&page=${page + 1}`;
      });
      this.logger.debug('Gethering scholarship links by pagination');
      const scholarshipSummariesPromise = scholarshipSummariesLinks.map(
        async (link) => {
          const page = await browser.newPage();
          this.logger.debug(`Navigating to: ${link}`);
          await page.goto(link);
          const scholarshipSummaries = await page.$$eval(
            scholarshipGridSelector,
            (nodes) =>
              nodes.map((node) => {
                const title = node.querySelector('a').textContent;
                const link = node.querySelector('a').getAttribute('href');
                const university = node.querySelector('p').textContent;

                const location = node.querySelector(
                  'ul > li:nth-child(1)',
                ).textContent;
                const level = node.querySelector(
                  'ul > li:nth-child(2)',
                ).textContent;
                const payment = node.querySelector(
                  'ul > li:nth-child(3)',
                ).textContent;

                return {
                  title,
                  link,
                  description: university,
                  location,
                  level,
                  payment,
                };
              }),
          );
          page.close();
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
          await detailsPage.goto(`${baseURL}${scholarshipSummary.link}`);
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

          detailsPage.close();
          return scholarshipSummary;
        },
      );

      const data = await Promise.all(scrapePromises);

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
}
