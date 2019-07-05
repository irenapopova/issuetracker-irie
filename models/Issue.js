const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const IssueSchema = new Schema({
  project: String, // for what project is the issue for
  issue_title: String,
  issue_text: String,
  created_by: String,
  assigned_to: {
    type: String,
    default: ''
  },
  status_text: {
    type: String,
    default: ''
  },
  created_on: {
    type: Date,
    default: Date.now
  },
  updated_on: {
    type: Date,
    default: Date.now
  },
  open: {
    type: Boolean,
    default: true
  }
});

const Issue = mongoose.model('issue', IssueSchema);

module.exports = Issue;
