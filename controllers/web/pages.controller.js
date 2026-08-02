'use strict';
const { validationResult } = require('express-validator');
const pagesService = require('../../services/web/pages.service');

function staticPage(view, title) {
  return (req, res) => res.render(`web/${view}`, { title });
}

async function contactForm(req, res) {
  res.render('web/contact', { title: 'Contact Us' });
}

async function contactSubmit(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', errors.array()[0].msg);
      return res.redirect('/contact');
    }
    await pagesService.submitContact(req.body);
    req.flash('success', 'Thanks for reaching out - we will get back to you soon.');
    res.redirect('/contact');
  } catch (err) {
    next(err);
  }
}

async function faqsPage(req, res, next) {
  try {
    const faqs = await pagesService.getFaqPageData();
    res.render('web/faqs', { title: 'FAQs', faqs });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  about: staticPage('about', 'About Us'),
  terms: staticPage('terms', 'Terms & Conditions'),
  privacyPolicy: staticPage('privacy-policy', 'Privacy Policy'),
  disclaimer: staticPage('disclaimer', 'Disclaimer'),
  contactForm,
  contactSubmit,
  faqsPage,
};
