var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// ==============================================
// Busqueda por coleccion
// ==============================================
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;

    var expresionRegular = new RegExp(busqueda, 'i');

    switch (tabla) {
        case 'medico':
            buscarMedicos(expresionRegular).then(medicos => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos
                });
            });
            break;
        case 'hospital':
            buscarHospitales(expresionRegular).then(hospitales => {
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales
                });
            });
            break;
        case 'usuario':
            buscarUsuario(expresionRegular).then(usuarios => {
                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                });
            });
            break;

        default:
            res.status(306).json({
                ok: false,
                mensaje: 'Error en la peticion'
            });
            break;
    }
});


// ==============================================
// Busqueda general
// ==============================================

app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;

    var regex = new RegExp(busqueda, 'i');

    Promise.all([
            buscarHospitales(regex),
            buscarMedicos(regex),
            buscarUsuario(regex)
        ])
        .then(respuestas => {

            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });

        });
});


function buscarHospitales(regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }

            });

    });
}

function buscarMedicos(regex) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }

            });

    });
}

function buscarUsuario(regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, "nombre email role")
            .or([
                { 'nombre': regex },
                { 'email': regex }
            ])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });

    });
}

module.exports = app;