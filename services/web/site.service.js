'use strict';
const siteRepo = require('../../repositories/web/site.repository');
const { groupDynamicFields } = require('../../helpers/dynamicFields');
const { buildPagination } = require('../../helpers/pagination');

const PER_PAGE = 20;

async function getHomeData() {
  try{
  const [marqueeItems, topPosts, sections, banners] = await Promise.all([
    siteRepo.getMarqueePosts(),
    siteRepo.getTopPosts(),
    siteRepo.getHomeSections(),
    siteRepo.getActiveBanners(),
  ]);

  // Group marquee posts by category, same as the old marqueeRows groupBy
  const marqueeRows = new Map();
  marqueeItems.forEach((p) => {
    const key = p.Category ? p.Category.name : 'General';
    if (!marqueeRows.has(key)) marqueeRows.set(key, []);
    marqueeRows.get(key).push(p);
  });

  const dynamicSections = await Promise.all(
    sections.map(async (s) => ({
      title: s.title,
      colorClass: s.color_class,
      category: s.Category,
      posts: await siteRepo.getPostsByCategoryId(s.category_id, s.post_limit),
    }))
  );


  return { marqueeRows: Array.from(marqueeRows.entries()), topPosts, dynamicSections, banners };
}
  catch (error) {
    console.error("========================================");
    console.error("HOME DATA ERROR");
    console.error("NAME:", error.name);
    console.error("MESSAGE:", error.message);
    console.error("SQL:", error.sql);
    console.error("PARENT:", error.parent?.message);
    console.error("PARENT SQL:", error.parent?.sql);
    console.error("========================================");

    throw error;

}
}

async function getCategoryPage(slug, page) {
  const category = await siteRepo.findCategoryBySlug(slug);
  if (!category) return null;
  const { rows, count } = await siteRepo.getPostsByCategoryPaginated(category.id, page, PER_PAGE);
  const faqs = await siteRepo.getFaqsByCategoryOrGlobal(category.id);
  return {
    category,
    posts: rows,
    pagination: buildPagination(page, count, PER_PAGE, `/category/${slug}`),
    faqs,
  };
}

async function getPostDetail(slug, viewerCtx) {
  const post = await siteRepo.findPostBySlug(slug);
  if (!post) return null;

  await siteRepo.incrementPostViews(post.id);
  await siteRepo.logEvent({
    trackableType: 'post', trackableId: post.id, eventType: 'view',
    userId: viewerCtx.userId, ip: viewerCtx.ip, userAgent: viewerCtx.userAgent, referrer: viewerCtx.referrer,
  });
const relatedPosts = await siteRepo.getRelatedPosts(post.category_id, post.id, 10);
const fieldGroups = groupDynamicFields(post.fields);
const faqs = await siteRepo.getFaqsByCategoryOrGlobal(post.category_id);

return { post, relatedPosts, fieldGroups, faqs };
}

async function trackLinkClick(postId, viewerCtx) {
  await siteRepo.incrementPostClicks(postId);
  await siteRepo.logEvent({
    trackableType: 'post', trackableId: postId, eventType: 'click',
    userId: viewerCtx.userId, ip: viewerCtx.ip, userAgent: viewerCtx.userAgent, referrer: viewerCtx.referrer,
  });
}

module.exports = { getHomeData, getCategoryPage, getPostDetail, trackLinkClick };
