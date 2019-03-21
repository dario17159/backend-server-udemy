var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

// default options
app.use(fileUpload());

// modelos importados
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de colecciones
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {

        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no es valida',
            errors: { message: 'Tipo de coleccion no valida' }
        });

    }

    if (!req.files) {

        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { meesage: 'Debe de seleccionar una imagen' }
        });
    }

    // obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extencion = nombreCortado[nombreCortado.length - 1];

    // Solo estas extensiones aceptamos
    var extensionesValidas = ['png', 'jpg', 'gift', 'jpeg'];

    if (extensionesValidas.indexOf(extencion) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: 'Las extensiones validas son: ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado 
    var nombreArchivo = `${id}-${ new Date().getMilliseconds()}.${extencion}`;

    // Mover el archivo del temporal a un path especifico
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al movel archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido',
        //     extension: extencion
        // });
    });


});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    switch (tipo) {
        case 'usuarios':
            Usuario.findById(id, (err, usuario) => {

                var pathViejo = './uploads/usuarios/' + usuario.img;

                // Si existe se elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlinkSync(pathViejo);
                }

                usuario.img = nombreArchivo;
                usuarioActualizado.password = ':)';

                usuario.save((err, usuarioActualizado) => {
                    res.status(200).json({
                        ok: true,
                        mensaje: "Imagen de usuario actualizada",
                        usuario: usuarioActualizado
                    });
                });

            });
            break;
        case 'medicos':
            Medico.findById(id, (err, medico) => {

                var pathViejo = './uploads/medicos/' + medico.img;

                // Si existe se elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlinkSync(pathViejo);
                }

                medico.img = nombreArchivo;

                medico.save((err, medicoActualizado) => {
                    res.status(200).json({
                        ok: true,
                        mensaje: "Imagen del medico actualizada",
                        medico: medicoActualizado
                    });
                });

            });
            break;
        case 'hospitales':
            Hospital.findById(id, (err, hospital) => {

                var pathViejo = './uploads/hospitales/' + hospital.img;

                // Si existe se elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlinkSync(pathViejo);
                }

                hospital.img = nombreArchivo;

                hospital.save((err, hospitalActualizado) => {
                    res.status(200).json({
                        ok: true,
                        mensaje: "Imagen del hospital actualizada",
                        hospital: hospitalActualizado
                    });
                });

            });
            break;

        default:
            break;
    }
}

module.exports = app;