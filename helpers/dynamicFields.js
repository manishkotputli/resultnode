'use strict';

// Groups a flat DynamicField[] (as stored: table_name/record_id/group_name/
// field_label/field_type/field_value/sort_order) into
// [{ group_name, fields: [...] }] preserving sort_order, so the view can
// render one table section per group - same visual pattern the original
// post-detail page used for Important Dates / Application Fee / Age Limit
// etc., just driven by data instead of hardcoded per-field markup.
function groupDynamicFields(fields) {
  const groups = [];
  const byName = new Map();
  (fields || [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
    .forEach((f) => {
      const key = f.group_name || 'Details';
      if (!byName.has(key)) {
        const g = { group_name: key, fields: [] };
        byName.set(key, g);
        groups.push(g);
      }
      byName.get(key).fields.push(f);
    });
  return groups;
}

module.exports = { groupDynamicFields };
