/*
*
*       Complete the API routing below
*
*/

'use strict';

const Issue = require('../models/Issue');

// converts < to &lt and > to &gt preventing XSS attack
function escapeMini(string) {
  return string ? string.replace(/[<]/g, '&lt').replace(/[>]/g, '&gt') : '';
}

function convertToJSON(issue, includeProject = false) {
  return {
    _id: issue._id,
    issue_title: escapeMini(issue.issue_title),
    issue_text: escapeMini(issue.issue_text),
    created_on: issue.created_on,
    updated_on: issue.updated_on,
    created_by: escapeMini(issue.created_by),
    assigned_to: escapeMini(issue.assigned_to),
    open: issue.open,
    status_text: escapeMini(issue.status_text),
    ...(includeProject && { project: escapeMini(issue.project) })
  };
}
function areAllFalsy(...args) {
  for (let arg of args) {
    if (arg) {
      return false;
    }
  }
  return true;
}

module.exports = function(app) {
  app
    .route('/api/issues/:project')

    .get(function(req, res) {
      var project = req.params.project;
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open,
        _id
      } = req.body;
      Issue.find(
        _id
          ? { _id: _id }
          : {
              project,
              ...(issue_text && { issue_text }),
              ...(issue_title && { issue_title }),
              ...(created_by && { created_by }),
              ...(assigned_to && { assigned_to }),
              ...(status_text && { status_text }),
              ...(open && { open })
            },
        (err, arr) => {
          if (err || !arr) return res.status(404).send('no issues found');
          else {
            let retArray = arr.map((el) => convertToJSON(el));
            res.json(retArray);
          }
        }
      );
    })

    .post(function(req, res) {
      var project = req.params.project;
      const { issue_title, issue_text, created_by } = req.body;
      if (!issue_title || !issue_text || !created_by) {
        return res
          .status(400)
          .send('Missing required fields, failed to create issue');
      }
      Issue.create(
        {
          project,
          issue_text,
          issue_title,
          created_by,
          ...(req.body.assigned_to && { assigned_to: req.body.assigned_to }),
          ...(req.body.status_text && { status_text: req.body.status_text })
        },
        (err, item) => {
          if (err || !item) {
            return res.status(500).send('failed to create issue');
          } else {
            res.json(convertToJSON(item));
          }
        }
      );
    })

    .put(function(req, res) {
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open,
        _id
      } = req.body;

      // Check if input is valid
      if (
        !_id ||
        areAllFalsy(
          issue_title,
          issue_text,
          created_by,
          assigned_to,
          status_text,
          open
        )
      ) {
        return res.status(400).send('no updated field sent');
      }

      // update database
      Issue.findByIdAndUpdate(
        _id,
        {
          updated_on: Date.now(),
          ...(issue_text && { issue_text }),
          ...(issue_title && { issue_title }),
          ...(created_by && { created_by }),
          ...(assigned_to && { assigned_to }),
          ...(status_text && { status_text }),
          ...(open && { open })
        },
        { new: true },
        (err, item) => {
          if (err || !item)
            return res.status(500).send('could not update ' + _id);
          else {
            return res.send('successfully updated');
          }
        }
      );
    })

    .delete(function(req, res) {
      const { _id } = req.body;
      if (!_id) {
        return res.status(400).send('_id error');
      }
      Issue.findByIdAndRemove(_id, (err) => {
        if (err) return res.status(500).send('could not delete ' + _id);
        else {
          return res.send('deleted ' + _id);
        }
      });
    });
};
