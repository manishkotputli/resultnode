'use strict';
const repo = require('../../repositories/admin/incomeexpense.repository');

const PER_PAGE = 15;
const BANKS_PER_PAGE = 8;

function toBool(v) {
  return v === 'on' || v === 'true' || v === '1' || v === true;
}

async function getList(query) {
  const page = parseInt(query.page, 10) || 1;
  const bankPage = parseInt(query.bank_page, 10) || 1;

  const [{ entries, total }, stats, { banks, total: banksTotal }, users, allBanks, allCategories] =
    await Promise.all([
      repo.list({
        search: query.search || '',
        type: query.type || '',
        userId: query.user || '',
        page,
        perPage: PER_PAGE,
      }),
      repo.getStats(),
      repo.listBanks({ page: bankPage, perPage: BANKS_PER_PAGE }),
      repo.usersForFilter(),
      repo.allBanksForSelect(),
      repo.allCategoriesForSelect(),
    ]);

  return {
    entries,
    total,
    page,
    perPage: PER_PAGE,
    stats,
    banks,
    banksTotal,
    bankPage,
    banksPerPage: BANKS_PER_PAGE,
    users,
    allBanks,
    allCategories,
  };
}

async function addEntry(body, loggedInUserId) {
  if (!body.user_id || !body.category_id || !body.type || !body.title || !body.amount || !body.transaction_date) {
    const err = new Error('User, category, type, title, amount and date are all required.');
    err.status = 400;
    throw err;
  }
  return repo.createEntry({
user_id: Number(loggedInUserId),
    category_id: Number(body.category_id),
    bank_id: body.bank_id ? Number(body.bank_id) : null,
    type: Number(body.type),
    title: body.title.trim(),
    amount: parseFloat(body.amount),
    note: body.note ? body.note.trim() : null,
    transaction_date: body.transaction_date,
  });
}

async function editEntry(id, body, loggedInUserId) {
  const entry = await repo.findEntryById(id);
  if (!entry) {
    const err = new Error('Entry not found');
    err.status = 404;
    throw err;
  }
  if (!body.user_id || !body.category_id || !body.type || !body.title || !body.amount || !body.transaction_date) {
    const err = new Error('User, category, type, title, amount and date are all required.');
    err.status = 400;
    throw err;
  }
  return repo.updateEntry(entry, {
    user_id: Number(loggedInUserId),
    category_id: Number(body.category_id),
    bank_id: body.bank_id ? Number(body.bank_id) : null,
    type: Number(body.type),
    title: body.title.trim(),
    amount: parseFloat(body.amount),
    note: body.note ? body.note.trim() : null,
    transaction_date: body.transaction_date,
  });
}

async function removeEntry(id, loggedInUserId) {
  const entry = await repo.findEntryById(id);

  if (
    !entry ||
    Number(entry.user_id) !== Number(loggedInUserId)
  ) {
    const err = new Error('Entry not found');
    err.status = 404;
    throw err;
  }

  return repo.deleteEntry(id);
}

async function addBank(body,loggedInUserId) {
  if (!body.user_id || !body.name) {
    const err = new Error('User and account name are required.');
    err.status = 400;
    throw err;
  }
  return repo.createBank({
    user_id: Number(loggedInUserId),
    name: body.name.trim(),
    account_number: body.account_number ? body.account_number.trim() : null,
    opening_balance: body.opening_balance ? parseFloat(body.opening_balance) : 0,
    is_active: toBool(body.is_active),
  });
}

async function editBank(id, body,loggedInUserId) {
  const bank = await repo.findBankById(id);
  if (!bank) {
    const err = new Error('Account not found');
    err.status = 404;
    throw err;
  }
  if (!body.user_id || !body.name) {
    const err = new Error('User and account name are required.');
    err.status = 400;
    throw err;
  }
  return repo.updateBank(bank, {
    user_id: Number(loggedInUserId),
    name: body.name.trim(),
    account_number: body.account_number ? body.account_number.trim() : null,
    opening_balance: body.opening_balance ? parseFloat(body.opening_balance) : 0,
    is_active: toBool(body.is_active),
  });
}

async function removeBank(id, loggedInUserId) {
  const bank = await repo.findBankById(id);

  if (
    !bank ||
    Number(bank.user_id) !== Number(loggedInUserId)
  ) {
    const err = new Error('Account not found');
    err.status = 404;
    throw err;
  }

  return repo.deleteBank(id);
}

module.exports = { getList, addEntry, editEntry, removeEntry, addBank, editBank, removeBank };