import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import puppeteer from 'puppeteer';
import { Public } from 'src/decorator/customize';

@Controller('crawler')
@ApiTags('crawler')
export class CrawlerController {
  @Get('/')
  @Public()
  @ApiOperation({
    summary: 'Crawl job listings from Indeed',
    description: 'Crawl job listings from Indeed',
  })
  async crawl() {
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      args: [
        '--start-maximized',
        '--no-sandbox',
        '--use-gl=egl',
        '--disable-setuid-sandbox',
      ],
      ignoreDefaultArgs: ['--disable-extensions'],
    });
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    );
    try {
      const baseURL = 'https://www.idp.com';
      await page.goto(`${baseURL}/find-a-scholarship/?subject=all-subject`);
      // Get the titles of the first 10 job listings
      const scholarshipGridSelector =
        '#root > div:nth-child(5) > div > div:nth-child(3) > section > div > div[class="mt-[28px] c-lg:mt-[40px] grid grid-cols-1 c-md:grid-cols-2 c-xl:grid-cols-3 gap-[12px] c-lg:gap-x-[24px] c-lg:gap-y-[28px]"] > div';

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

      const scrapePromises = scholarshipSummaries.map(
        async (scholarshipSummary) => {
          // go to the job listing page
          console.log('\n\nScrapping', {
            name: scholarshipSummary.title,
            link: scholarshipSummary.link,
          });
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

      return data;
    } catch (error) {
      console.error('Error while scraping job listings:', error);
    } finally {
      await browser.close();
    }
  }
}
