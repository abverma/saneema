const {MongoClient, ObjectID} = require('mongodb')
const {
	DB_USERNAME, 
	DB_PASSWORD, 
	DB_HOST, 
	DB_PORT, 
	DB_NAME, 
	LOG_LEVEL } = process.env

let uri

if (DB_HOST == 'localhost' || DB_HOST == '0.0.0.0') {
	uri = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}?retryWrites=true&w=majority&connectTimeoutMS=300000`
} else {
	uri = `mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?retryWrites=true&w=majority&connectTimeoutMS=300000`
}

const client = new MongoClient(uri, { 
	useUnifiedTopology: true,
	loggerLevel: LOG_LEVEL,
	logger: console.log 
})

let db = null

exports.connect = (callback) => {

		client.connect(err => {
			if (err) {
				console.error(err)
				if (callback) {
					return callback(err)
				} else {
					return Promise.reject(err)
				}
			}

			console.log('Connection successful!')
			db = client.db(DB_NAME)

			if (callback) {
				return callback(null, db)
			} else {
				return Promise.resolve(db)
			}
			
		})
}

exports.getDb = () => {
	return db
}

exports.getUri = () => {
	return uri
}

exports.close = () => {
	client.close()
		.then(() => {
			console.log('Connection closed!')
		})
		.catch((err) => {
			console.error(err)
			console.log('Error in closing connection!')
		})
}	