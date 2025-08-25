const express = require('express');
const mysql = require('mysql2');
const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); // 👉 Para leer datos de formularios
app.use(express.json()); // 👉 Para leer JSON si lo necesitas en API



const port = 3000;

// Configuración de conexión a MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',     // tu usuario MySQL
  password: '',     // tu contraseña MySQL
  database: 'tienda_api' // asegúrate de haber creado esta BD
});

// Verificar conexión
db.connect(err => {
  if (err) {
    console.error('❌ Error en la conexión a MySQL:', err);
    return;
  }
  console.log('✅ Conectado a MySQL');
});

// Ruta principal
app.get('/', (req, res) => {
  res.redirect('/productos'); // 👉 redirige a productos directamente
});

// 📖 LISTAR productos
app.get('/productos', (req, res) => {
  db.query('SELECT * FROM productos', (err, results) => {
    if (err) {
      console.error('Error en la consulta:', err);
      res.status(500).send('Error en la consulta');
    } else {
      res.render('productos', { productos: results });
    }
  });
});

// ➕ FORMULARIO nuevo producto
app.get('/productos/nuevo', (req, res) => {
  res.render('nuevo');
});

// ➕ CREAR producto
app.post('/productos', (req, res) => {
  const { nombre, precio } = req.body;
  db.query('INSERT INTO productos (nombre, precio) VALUES (?, ?)', [nombre, precio], (err) => {
    if (err) {
      console.error('Error al insertar:', err);
      res.status(500).send('Error al insertar');
    } else {
      res.redirect('/productos');
    }
  });
});

// ✏️ FORMULARIO editar producto
app.get('/productos/editar/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM productos WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).send('Producto no encontrado');
    }
    res.render('editar', { producto: results[0] });
  });
});

// ✏️ ACTUALIZAR producto
app.post('/productos/editar/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, precio } = req.body;
  db.query('UPDATE productos SET nombre = ?, precio = ? WHERE id = ?', [nombre, precio, id], (err) => {
    if (err) {
      console.error('Error al actualizar:', err);
      res.status(500).send('Error al actualizar');
    } else {
      res.redirect('/productos');
    }
  });
});

// ❌ ELIMINAR producto
app.post('/productos/eliminar/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM productos WHERE id = ?', [id], (err) => {
    if (err) {
      console.error('Error al eliminar:', err);
      res.status(500).send('Error al eliminar');
    } else {
      res.redirect('/productos');
    }
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
