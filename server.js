require('dotenv').config()
const express = require('express')
const axios = require('axios')
const path = require('path')

const dbManager = require('./db')
const Movies = require('./models/movies')
const publicDir = path.join(__dirname + '/public')
const app = express()

const request = (movie) => {
	let title = movie.title.replace(' ', '+')
	let year = movie.year
	let url = process.env.OMDB_URL + process.env.OMDB_API_KEY + '&s=' + title + '&r=json'

	if (year) {
		url += '&y=' + year
	}
	return axios.get(url)
}

app.use(express.static(publicDir))

app.get('/', (req, res) => {
	res.sendFile(path.join(publicDir, '/index.html'))
})
app.get('/add', (req, res) => {
	const {imdbID} = req.query
	Movies.seachAndInsert(req.query)
	.then(resp => {
		res.send({
			success: true
		})
	})
	.catch(err => {
		console.log(err)
		res.send({
			success: false
		})
	})
})
app.get('/search', (req, res) => {
	const {title, year} = req.query
	request({
		title,
		year
	})
	.then(resp => {
		if (resp.data.Search) {
			Movies.findInsertSearched(resp.data.Search)
		}
		res.send({
			success: true,
			data: resp.data.Search
		})
	})
	.catch(err => {
		console.log(err)
		res.send(err)
	})
})
app.get('/movies', (req, res) => {
	Promise.all([Movies.find(), Movies.count()])
	.then((result) => {
		res.send({
			success: true,
			data: result[0],
			count: result[1]
		})
	})
	.catch(err => {
		console.log(err)
		res.send(err)
	})
})
app.delete('/movies/:id', (req, res) => {
	const {id} = req.params
	Movies.delete({
		imdbID: id
	})
	.then(()=>{
		res.send({
			success: true
		})
	})
	.catch(err => {
		console.log(err)
		res.send({
			success: false
		})
	})
})

app.listen(process.env.PORT, process.env.HOST, () => {
	console.log(`[${new Date().toUTCString()}] Server started`)
	console.log(`Server listening at ${process.env.PORT}`)
	console.log('Connecting to db')

	dbManager.connect((err, result) => {
		if (err) {
			console.log('Could not connect to db')
			console.error(err)
		}
		else {
			db = result
		}
	})
})