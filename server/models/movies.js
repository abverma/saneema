const {ObjectID} = require('mongodb') 
const dbManager = require('../db')
const async = require('async')

exports.seachAndInsert = (movie) => {
	const db = dbManager.getDb()
	let create
	return db.collection('searched').findOne({
		imdbID: movie.imdbID,
	})
	.then(found => {
		create = found
		return db.collection('movies').findOne({
			imdbID: found.imdbID,
			user_id: ObjectID("5eef43a67e31d85a0242eff7")
		})
	})
	.then(found => {
		if (found) {
			console.log('Movie already exists for user')
			return Promise.resolve()
		} else {
			create['creation_date'] = new Date()
			create['last_update_date'] = new Date()
			create['user_id'] = ObjectID("5eef43a67e31d85a0242eff7")
			create['list'] = 'Watched'
			return db.collection('movies').insertOne(create)
		}
	})
	.catch(err => {
		console.log(err)
		return Promise.reject()
	})
}


exports.findInsertSearched = (movies) => {
	const db = dbManager.getDb()

	return new Promise((resolve, reject) => {
		async.eachLimit(movies, 1, (movie, done) => {
			db.collection('searched').findOne({
				imdbID: movie.imdbID,
			})
			.then(found => {
				if (found) {
					console.log('Movie already exists as searched')
					return Promise.resolve()
				} else {
					movie['creation_date'] = new Date()
					movie['last_update_date'] = new Date()
					return db.collection('searched').insertOne(movie)
				}
			})
			.then(() => {
				done()
			})
		}, (err) => {
			if (err) {
				return reject(err)
			}
			resolve()
		})
	})
}

exports.find = () => {
	return db.collection('movies').find({
		user_id: ObjectID("5eef43a67e31d85a0242eff7")
	}, {
		projection: {
			_id: 1,
			imdbID: 1, 
			Title: 1,
			Year: 1,
			Poster: 1,
			Type: 1
		},
		limit: 25,
		sort: [['_id', 'descending']]
	}).toArray()
}

exports.count = () => {
	return db.collection('movies').countDocuments({
		user_id: ObjectID("5eef43a67e31d85a0242eff7")
	})
}


exports.delete = (movie) => {
	return db.collection('movies').deleteOne({
		imdbID: movie.imdbID,
		user_id: ObjectID("5eef43a67e31d85a0242eff7")
	})
}