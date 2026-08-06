'use strict';
const testSeriesService = require('../../services/admin/testSeries.service');
const { buildPagination } = require('../../helpers/pagination');

async function index(req, res, next) {
  try {
    const { items, total, page, perPage } = await testSeriesService.getList(req.query);
    const pagination = buildPagination(page, total, perPage, '/admin/test-series');
    res.render('admin/test-series/index', {
      title: 'Test Series',
      active: 'test-series',
      items,
      total,
      pagination,
      filters: { search: req.query.search || '', status: req.query.status || '' },
    });
  } catch (err) {
    next(err);
  }
}

function createForm(req, res) {
  res.render('admin/test-series/form', {
    title: 'Add Test Series',
    active: 'test-series',
    mode: 'create',
    item: null,
    formAction: '/admin/test-series',
  });
}

async function store(req, res, next) {
  try {
    await testSeriesService.create(req.body, req.file);
    req.flash('success', 'Test series created successfully.');
    res.redirect('/admin/test-series');
  } catch (err) {
    if (err.status === 400) {
      req.flash('error', err.message);
      return res.redirect('/admin/test-series/create');
    }
    next(err);
  }
}

async function editForm(req, res, next) {
  try {
    const item = await testSeriesService.getById(req.params.id);
    if (!item) {
      req.flash('error', 'Test series not found.');
      return res.redirect('/admin/test-series');
    }
    res.render('admin/test-series/form', {
      title: 'Edit Test Series',
      active: 'test-series',
      mode: 'edit',
      item,
      formAction: `/admin/test-series/${item.id}/update`,
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    await testSeriesService.update(req.params.id, req.body, req.file);
    req.flash('success', 'Test series updated successfully.');
    res.redirect('/admin/test-series');
  } catch (err) {
    if (err.status === 400 || err.status === 404) {
      req.flash('error', err.message);
      return res.redirect(`/admin/test-series/${req.params.id}/edit`);
    }
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    await testSeriesService.remove(req.params.id);
    req.flash('success', 'Test series deleted successfully.');
    res.redirect('/admin/test-series');
  } catch (err) {
    if (err.status === 404) {
      req.flash('error', err.message);
      return res.redirect('/admin/test-series');
    }
    next(err);
  }
}

// ---- Tests ----

async function testsIndex(req, res, next) {
  try {
    const { series, tests, total, page, nextNumber } = await testSeriesService.getTests(req.params.seriesId, req.query);
    const pagination = buildPagination(page, total, 20, `/admin/test-series/${series.id}/tests`);
    res.render('admin/test-series/tests', {
      title: `Tests - ${series.title}`,
      active: 'test-series',
      series,
      tests,
      total,
      pagination,
      nextTestNumber: nextNumber,
    });
  } catch (err) {
    if (err.status === 404) {
      req.flash('error', err.message);
      return res.redirect('/admin/test-series');
    }
    next(err);
  }
}

async function storeTest(req, res, next) {
  try {
    await testSeriesService.addTest(req.params.seriesId, req.body);
    req.flash('success', 'Test added successfully.');
    res.redirect(`/admin/test-series/${req.params.seriesId}/tests`);
  } catch (err) {
    if (err.status === 400 || err.status === 404) {
      req.flash('error', err.message);
      return res.redirect(`/admin/test-series/${req.params.seriesId}/tests`);
    }
    next(err);
  }
}

async function updateTest(req, res, next) {
  try {
    await testSeriesService.editTest(req.params.testId, req.body);
    req.flash('success', 'Test updated successfully.');
    res.redirect(`/admin/test-series/${req.params.seriesId}/tests`);
  } catch (err) {
    if (err.status === 400 || err.status === 404) {
      req.flash('error', err.message);
      return res.redirect(`/admin/test-series/${req.params.seriesId}/tests`);
    }
    next(err);
  }
}

async function destroyTest(req, res, next) {
  try {
    await testSeriesService.removeTest(req.params.testId);
    req.flash('success', 'Test deleted successfully.');
    res.redirect(`/admin/test-series/${req.params.seriesId}/tests`);
  } catch (err) {
    if (err.status === 404) {
      req.flash('error', err.message);
      return res.redirect(`/admin/test-series/${req.params.seriesId}/tests`);
    }
    next(err);
  }
}

// ---- Questions ----

async function questionsIndex(req, res, next) {
  try {
    const { test, questions, total, page } = await testSeriesService.getQuestions(req.params.testId, req.query);
    const pagination = buildPagination(page, total, 20, `/admin/test-series/${req.params.seriesId}/tests/${test.id}/questions`);
    res.render('admin/test-series/questions', {
      title: `Questions - ${test.title}`,
      active: 'test-series',
      seriesId: req.params.seriesId,
      test,
      questions,
      total,
      pagination,
    });
  } catch (err) {
    if (err.status === 404) {
      req.flash('error', err.message);
      return res.redirect(`/admin/test-series/${req.params.seriesId}/tests`);
    }
    next(err);
  }
}

async function storeQuestion(req, res, next) {
  try {
    await testSeriesService.addQuestion(req.params.testId, req.body);
    req.flash('success', 'Question added successfully.');
    res.redirect(`/admin/test-series/${req.params.seriesId}/tests/${req.params.testId}/questions`);
  } catch (err) {
    if (err.status === 400 || err.status === 404) {
      req.flash('error', err.message);
      return res.redirect(`/admin/test-series/${req.params.seriesId}/tests/${req.params.testId}/questions`);
    }
    next(err);
  }
}

async function updateQuestion(req, res, next) {
  try {
    await testSeriesService.editQuestion(req.params.questionId, req.body);
    req.flash('success', 'Question updated successfully.');
    res.redirect(`/admin/test-series/${req.params.seriesId}/tests/${req.params.testId}/questions`);
  } catch (err) {
    if (err.status === 400 || err.status === 404) {
      req.flash('error', err.message);
      return res.redirect(`/admin/test-series/${req.params.seriesId}/tests/${req.params.testId}/questions`);
    }
    next(err);
  }
}

async function destroyQuestion(req, res, next) {
  try {
    await testSeriesService.removeQuestion(req.params.questionId);
    req.flash('success', 'Question deleted successfully.');
    res.redirect(`/admin/test-series/${req.params.seriesId}/tests/${req.params.testId}/questions`);
  } catch (err) {
    if (err.status === 404) {
      req.flash('error', err.message);
      return res.redirect(`/admin/test-series/${req.params.seriesId}/tests/${req.params.testId}/questions`);
    }
    next(err);
  }
}

// ---- Attempts / Results ----

async function attemptsIndex(req, res, next) {
  try {
    const { series, tests, attempts, total, page } = await testSeriesService.getAttempts(req.params.seriesId, req.query);
    const pagination = buildPagination(page, total, 20, `/admin/test-series/${series.id}/results`);
    res.render('admin/test-series/results', {
      title: `Results - ${series.title}`,
      active: 'test-series',
      series,
      tests,
      attempts,
      total,
      pagination,
      filters: { test: req.query.test || '', user: req.query.user || '' },
    });
  } catch (err) {
    if (err.status === 404) {
      req.flash('error', err.message);
      return res.redirect('/admin/test-series');
    }
    next(err);
  }
}

async function destroyAttempt(req, res, next) {
  try {
    await testSeriesService.removeAttempt(req.params.attemptId);
    req.flash('success', 'Attempt removed successfully.');
    res.redirect(`/admin/test-series/${req.params.seriesId}/results`);
  } catch (err) {
    if (err.status === 404) {
      req.flash('error', err.message);
      return res.redirect(`/admin/test-series/${req.params.seriesId}/results`);
    }
    next(err);
  }
}

module.exports = {
  index, createForm, store, editForm, update, destroy,
  testsIndex, storeTest, updateTest, destroyTest,
  questionsIndex, storeQuestion, updateQuestion, destroyQuestion,
  attemptsIndex, destroyAttempt,
};
