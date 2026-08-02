# Sarkari Result - Node.js Port

Public website only (as requested) - rebuilt from the Laravel app in
`Result.zip`, filled into the Node scaffold from `result_node.zip`
(routes -> controllers -> services -> repositories -> models, admin/web
split). Admin side is intentionally left empty for you to build.

## Quick start

```bash
npm install
cp .env.example .env          # already points at SQLite, zero setup needed
npm run db:migrate
npm run db:seed
npm run dev                   # http://localhost:3000
```

That's it - no external database server required by default. `.env` ships
with `DB_DIALECT=sqlite` because that's what the Laravel app itself defaults
to. To point at MySQL instead (e.g. to reuse the same DB as Laravel), edit
`.env`:

```
DB_DIALECT=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=sarkari_result
DB_USER=root
DB_PASSWORD=
```

Seed data included: 4 roles, 6 categories, a demo student + content-desk
user, full site settings (using your real logo/favicon/FAQ images), a
**RAS 2027** result post (your own example) with dynamic fields + important
links, an SSC CGL post, 4 more posts across categories, 2 blog posts, 6 home
sections, sidebar menu list + permissions, 2 courses, 2 test series, and
FAQs.

Demo login: `student@example.com` / `password123`

## What's real vs. what's demo

Every page under `views/web/` (home, category, post detail, blog, contact,
faqs, about, terms, privacy-policy, disclaimer, maintenance) is a faithful
port of your actual Blade files - same CSS (`sarkari-style.css`, copied as-is
into `public/css/`), same table structure, same class names. If it looked a
certain way in Laravel, it looks the same way here.

`courses`, `test-series`, `auth`, and `dashboard` pages are new (you didn't
have these yet) - built in the same visual language (red accents, card/table
style) so they don't look bolted on, but there was no original to match
pixel-for-pixel.

## Architecture (matches the scaffold you already had)

```
routes/web/<domain>.routes.js
  -> controllers/web/<domain>.controller.js   (req/res only)
    -> services/web/<domain>.service.js       (business logic)
      -> repositories/web/<domain>.repository.js  (Sequelize queries)
        -> models/                            (28 Sequelize models)
```

7 domains: `site` (home/category/post), `blog`, `pages` (about/contact/
terms/privacy/disclaimer/faqs), `auth`, `courses`, `testSeries`, `dashboard`.

`middlewares/globals.js` replaces Laravel's `AppServiceProvider::boot()` -
it injects `site_setting` and `navCategories` into every view's locals,
same as the `View::share()` + view composer it had.

## The schema - what changed from Laravel and why

**Kept exactly as-is:** `categories`, `post_links`, `banners`,
`home_sections`, `blog_categories`, `blogs`, `settings`, `contact_messages`,
`faqs`/`faq_answers`, `visitors`, `scraping_websites`.

**Folded into `posts` (your instruction - "maine alag le li galti se"):**
- `marquees` + `top_boxes` -> `posts.is_marquee` / `posts.is_top`, plus one
  shared `highlight_color` column so you don't lose the per-item colour
  control those tables gave you. Home page now pulls marquee/top content
  straight from flagged posts instead of hand-duplicating title+url.

**Replaced:** `post_meta` / `post_metas` (the two duplicate, half-wired
tables - not used in any controller or view yet) -> a single generic
**`dynamic_fields`** table:

```
table_name, record_id, group_name, field_label, field_type, field_value, sort_order
```

This is exactly your spec: works against `post`, `blog`, `course`, or
anything else by name, so adding a new attribute to a post is an insert,
never a migration. The old fixed columns on `posts` (organization,
post_name, fees, ages, eligibility, apply_process, important_questions...)
are gone from the schema - the post-detail page now renders whatever
`dynamic_fields` groups exist, in the same table/colour/list styling the
original had. `full_description`, `meta_title/keywords/description` stayed
as real columns since they're single free-text fields, not repeating
attributes.

**Extended:** `scraping_logs` gained `status` (draft/published/rejected,
defaults to draft) and a nullable `post_id` - so scraped data lands as a
draft and only becomes a real post once you publish it from the admin side,
per your spec.

**New tables (from your text spec, not in Laravel yet):** `roles` (User/US,
Super Admin/SA, Admin/AD, Developer/DEV - `users.role_id` + auto-generated
`user_code` like `US-000001`), `courses`, `test_series`, `purchases`
(polymorphic), `banks`, `income_expense_categories` (`type`: 1=income,
2=expense, exactly as specified), `income_expenses`, `comments` + `likes`
(polymorphic, for blog), `post_views` (granular view/click log per post,
for the category-wise admin analytics you described), `sidebar_menus` +
`sidebar_menu_permissions` (role-based).

One thing worth flagging: your Laravel `users` table has a third role,
`editor`, that isn't in your 4-role list. I didn't add it - only User/Super
Admin/Admin/Developer are seeded. Easy to add back if you want it.

## Explicitly out of scope (per your message)

- **Admin panel** - not built. `controllers/admin`, `repositories/admin`,
  `services/admin`, `routes/admin`, `views/admin`, `views/adminlayout` are
  left empty, matching what you already had.
- **Payment gateway** - `POST /courses/:slug/buy` and
  `/test-series/:slug/buy` currently mark the purchase `completed`
  immediately (see `TODO` in `repositories/web/dashboard.repository.js`) so
  the whole flow is testable end-to-end. Wire Razorpay/PayU/etc. there when
  ready.
- **Actual scraper bot** - you asked for the *table* to hold scraped data,
  not a scraper script, so none was written.
- **Test-taking engine** - "test series" is modeled as a purchasable
  product only (title/price), not an exam engine with questions/scoring,
  since that wasn't in the spec.

## Verified end-to-end

Migrations, seeders, and the full app were run and tested against a real
SQLite database before packaging - not just syntax-checked: home page
(marquee/top-boxes/sections), category listing, post detail (dynamic
fields rendering + grouped by section), blog list/detail, register -> login
-> buy course -> purchases page, income-expense category + entry creation,
blog like/comment, and the `/go/:id` link-click tracker (redirects **and**
logs to `post_views`) all round-tripped correctly with real data.

## Next step

Your actual Blade files were used for every ported page, so the UI should
match closely already. If anything's off, or you're ready to start on the
admin side, just say the word.
