const express = require('express')
const axios = require('axios')
require('dotenv').config()

const app = express()

const IP_INFO_SECRET_KEY = process.env.IP_INFO_SECRET_KEY
const OPEN_WEATHER_MAP_API_KEY = process.env.OPEN_WEATHER_MAP_API_KEY
const PORT = process.env.PORT

// app.get('/api/hello', async (req, res) => {
app.get('/', async (req, res) => {
    const visitor_name = req.query.visitor_name || "Guest"

    const client_ip = await get_client_ip(res)

    const location_data = await get_location(client_ip, res)
    const city = location_data['city']
    const lon = location_data['lon']
    const lat = location_data['lat']

    const temperature = await get_temperature(lon, lat, res)
    const temp = Math.round(temperature) - 273

    greeting = `Hello, ${visitor_name}! The temperature is ${temp} degrees Celsius in ${city}`

    const response = {
        "client_ip": client_ip,
        "location": city,
        "greeting": greeting
    }

    return res.json(response)

})

const get_client_ip = async (res) => {
    const ip_info_url = `https://ipinfo.io/json?token=${IP_INFO_SECRET_KEY}`
    let ip = ""
    await axios.get(ip_info_url)
    .then((response) => {
        ip = response.data.ip
    })
    .catch((err) => {
        console.log(err)
        return res.status(500).json({"message": "Unable to retrieve ip address"})
    })
    return ip
}

const get_location = async (ip, res) => {
    const location_url = `http://ip-api.com/json/${ip}`
    let location = ""
    await axios.get(location_url)
    .then((response) => {
        location = response.data
    })
    .catch((err) => {
        console.log(err)
        return res.status(500).json({"message": "Unable to retrieve location"})
    })
    return location
}

const get_temperature = async (lon, lat) => {
    const weather_url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_MAP_API_KEY}`
    let temp = 0
    await axios.get(weather_url)
    .then((response) => {
        weather_response = response.data
        temp = weather_response['main']['temp']
    })
    .catch((err) => {
        console.log(err)
        return res.status(500).json({"message": "Unable to retrieve temperature"})
    })
    return temp
}

app.listen(PORT, () => {
    console.log(`app is listening on port: ${PORT}...`)
})
