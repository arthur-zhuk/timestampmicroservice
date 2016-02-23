'use strict';
var moment = require('moment');
var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/login');
		}
	}

	var clickHandler = new ClickHandler();

	app.route('/')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/index.html');
		});

	app.route('/login')
		.get(function (req, res) {
			res.sendFile(path + '/public/login.html');
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/login');
		});

	app.route('/profile')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/profile.html');
		});

	app.route('/api/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.github);
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/login'
		}));

	app.route('/:date')
		.get(function (req, res) {
			var parameterEntered = req.params.date;
			if (parameterEntered.indexOf(" ") >= 0) {
				var time = parameterEntered.replace(/%20/g, " ");
				res.json({'unix': moment(time).unix(), 'natural': moment(time, ["MMM DD YYYY"]).format("MMMM DD, YYYY")});
			}
			else if (parameterEntered.indexOf("%") >= 0) {
				var time1 = parameterEntered.replace(/%20/g, " ");
				res.json({'unix': moment(time1).unix(), 'natural': moment(time1, ["MMM DD YYYY"]).format("MMMM DD, YYYY")});
			}
			else if (parameterEntered.indexOf(" ") === -1 || parameterEntered.indexOf("%") === -1) {
				res.json({'unix': parameterEntered, 'natural': moment.unix(parameterEntered).format("MMMM DD, YYYY")});
			} else {
				return null;
			}
		})

	app.route('/api/:id/clicks')
		.get(isLoggedIn, clickHandler.getClicks)
		.post(isLoggedIn, clickHandler.addClick)
		.delete(isLoggedIn, clickHandler.resetClicks);
};
