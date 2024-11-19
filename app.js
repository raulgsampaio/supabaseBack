const express = require('express');
const supabaseClient = require('@supabase/supabase-js');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Configuração de CORS
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
};

app.use(cors(corsOptions)); // Habilitar CORS

// Middleware para logs e body parsing
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuração do Supabase
const supabase = supabaseClient.createClient(
    'https://djdjweqndqlrkbvxsvmj.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqZGp3ZXFuZHFscmtidnhzdm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEwMjU1ODMsImV4cCI6MjA0NjYwMTU4M30.XgjhPpk4qXliOKxwaybPesGpAPaQ816KuFDfyw-qYEY'
);

// Rotas

// Listar todos os produtos
app.get('/products', async (req, res) => {
    const { data, error } = await supabase.from('products').select();
    if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to fetch products', error });
    }
    res.send(data);
    console.log('List of products:', data);
});

// Obter produto por ID
app.get('/products/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('products').select().eq('id', id);
    if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to fetch product', error });
    }
    if (!data || data.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.send(data[0]);
    console.log('Product fetched:', data[0]);
});

// Criar um novo produto
app.post('/products', async (req, res) => {
    const { name, description, price } = req.body;
    if (!name || !description || !price) {
        return res.status(400).json({ message: 'All fields (name, description, price) are required.' });
    }
    const { data, error } = await supabase.from('products').insert({ name, description, price });
    if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to create product', error });
    }
    res.status(201).json({ message: 'Product created successfully', data });
    console.log('Product created:', data);
});

// Atualizar um produto existente
app.put('/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, price } = req.body;

    // Validação de dados
    if (!name || !description || !price) {
        return res.status(400).json({ message: 'All fields (name, description, price) are required.' });
    }

    try {
        const { data, error } = await supabase
            .from('products')
            .update({ name, description, price })
            .eq('id', id);

        if (error) {
            console.error('Supabase Error:', error);
            return res.status(400).json({ message: 'Failed to update product', error });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product updated successfully', data });
        console.log('Product updated:', data);
    } catch (err) {
        console.error('Server Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Deletar um produto
app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to delete product', error });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
    console.log('Product deleted:', id);
});

// Rotas padrão
app.get('/', (req, res) => {
    res.send('Hello! The Supabase API is running. <3');
});

app.get('*', (req, res) => {
    res.send('The requested resource was not found.');
});

// Iniciar o servidor
app.listen(3000, () => {
    console.log('> Ready on http://localhost:3000');
});
