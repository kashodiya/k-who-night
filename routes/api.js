var express = require('express');
var router = express.Router();
var Going = require('../going');
var util = require('../util');
//var _ = require('lodash');
var async = require('async');


var setGoingCount = function(businesses, onDate, whenDone){
  var ib = businesses.length - 1;
  var queries = [];
  businesses.forEach(function(b, i){
    queries.push(function(cb) {Going.count({placeId: b.id, onDate: onDate}, cb)});
  });
  async.parallel(queries, function(err, res) {
    whenDone(err, res);
  });  
}

var setIsGoing = function(businesses, username, onDate, whenDone){
  var ib = businesses.length - 1;
  var queries = [];
  businesses.forEach(function(b, i){
    queries.push(function(cb) {Going.count({placeId: b.id, username: username, onDate: onDate}, cb)});
  });
  async.parallel(queries, function(err, res) {
    whenDone(err, res);
  });  
}


router.get('/search', function(req, res, next) {
  
//  console.log(req.yelp);
  
  req.yelp.search({
    term: req.query.term,
    location: req.query.location
  })
  .then(function (data) {
    //console.log(data);
    setGoingCount(data.businesses, req.query.onDate, function(err, counts){
      data.businesses.forEach(function(b, i){
        b.goingCount = counts[i];
      });
      setIsGoing(data.businesses, req.user.username, req.query.onDate, function(err, counts){
        console.log('is going counts', counts);
        data.businesses.forEach(function(b, i){
          if(counts[i] > 0){
            b.going = true;
          }else{
            b.going = false;
          }
        });
        res.json({status: 'success', response: data});
      });
    });
  }, function(err){
    res.json({
      status: 'fail',
      err: err
    });
  })  
  
});



router.get('/goings', function (req, res) {
  Going.find({username: req.user.username}, function (err, goings) {
    if (err) {
      res.json({
        status: 'fail',
        err: err
      });
    } else {
      res.json({status: 'success', goings: goings});
    }
  });
});

router.post('/removeGoing', util.ensureAuthenticatedApi, function (req, res) {
  var find = {placeId: req.body.placeId,
                username: req.user.username,
                onDate: req.body.onDate
               };
  console.log('Removing going: find=', find);
  Going.remove(find, function(err, obj){
    console.log('Removed, err=', err);
    if(err){
      console.log('remove error', err);
      res.json({status: 'fail', err: err});
    }else{
      console.log('Removed! delCount', obj.result.n);
      //TODO: What if the delete count is 0? 
      res.json({status: 'success', operation: 'removed'});
    }
  });
});

router.post('/addGoing', util.ensureAuthenticatedApi, function (req, res) {
  var g = new Going();
  g.username = req.user.username;
  g.placeId = req.body.placeId;
  g.placeName = req.body.placeName;
  g.placeAddress = req.body.placeAddress;
  g.onDate = req.body.onDate;
  g.save(function(err, doc){
//    console.log(err, doc);
    if(err){
      res.json({status: 'fail', err: err});
    }else{
      res.json({status: 'success', operation: 'added'});
    }
  });
  
//  Going.find({username: req.user.username}, function (err, goings) {
//    if (err) {
//      res.json({
//        status: 'fail',
//        err: err
//      });
//    } else {
//      res.json({status: 'success', goings: goings});
//    }
//  });
});


/*
router.get('/poll/:id', function (req, res) {
  console.log('finding by id', {
    id: req.params.id
  });

  Poll.findById(req.params.id, function (err, poll) {
    if (err) {
      res.json({
        status: 'fail',
        err: err
      });
    } else {
      res.json({
        status: 'success',
        poll: poll
      });
    }
  });
});
*/

router.get('/config', function (req, res) {
  res.json({
    baseUrl: process.env.BASE_URL
  });
});

module.exports = router;