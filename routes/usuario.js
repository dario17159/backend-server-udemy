var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

// Importamos el modelo de usuario de la carpeta models
var Usuario = require('../models/usuario');

// ==============================================
// Obtener todos los usuarios
// ==============================================

app.get('/', (req, res, next) => {


    Usuario.find({}, 'nombre email img role').exec((err, usuarios) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando usuarios',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            usuarios: usuarios
        });

    })
});

// ==============================================
// Fin de Obtener todos los usuarios
// ==============================================


// ==============================================
// Crear un nuevo usuario
// ==============================================

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });
});

// ==============================================
// Fin de Crear un nuevo usuario
// ==============================================

// ==============================================
// Actualizar un usuario
// ==============================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: `El usuario con el ${id} no existe`,
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });
    });
});

// ==============================================
// Fin de Actualizar datos del Usuario
// ==============================================

// ==============================================
// Borrar Usuario por el id
// ==============================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: `No existe el usuario con el id ${id}`,
                errors: { message: 'Usuario inexistente' }
            });
        }

        usuarioBorrado.password = ':(';

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

// ==============================================
// Fin de Borrar el usuario por ID
// ==============================================

module.exports = app;