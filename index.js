import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import palsData from "./public/data/pals.json" with { type: "json" };
import elementsData from "./public/data/elements.json" with  { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001;
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.1.2',
    info: {
      title: 'Pals & Elements API',
      version: '1.0.0',
      description: 'A CRUD API for managing Pals and Elements',
    },
    servers: [
      {
        url: `http://localhost:3001`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./docs/*.yaml'], // Updated to use YAML files from docs folder
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Swagger Tutorial API',
    status: 'Server is running',
    availableRoutes: {
      pals: [
        'GET /api/pals - Get all pals',
        'GET /api/pals/:id - Get pal by ID',
        'POST /api/pals - Create a new pal',
        'PUT /api/pals/:id - Update pal by ID',
        'DELETE /api/pals/:id - Delete pal by ID'
      ],
      elements: [
        'GET /api/elements - Get all elements',
        'GET /api/elements/:name - Get element by name',
        'POST /api/elements - Create a new element',
        'PUT /api/elements/:name - Update element by name',
        'DELETE /api/elements/:name - Delete element by name'
      ],
      other: [
        'GET /health - Health check'
      ]
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Get all pals
app.get('/api/pals', (req, res) => {
  res.json(palsData);
});

// Get pal by pal id
app.get('/api/pals/:id', (req, res) => {
  try {
    const pals = palsData.pals
    let pal = pals.find((pal, index) => pal.id === req.params.id)
    if (!pal) {
      return res.status(404).json({
        error: 'Pal not found',
        message: `No pal found with ID: ${req.params.id}`
      });
    }
    return res.json({ pal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new pal
app.post('/api/pals', (req, res) => {
  try {
    const newPal = req.body;

    // Validate required fields
    if (!newPal.name || !newPal.elements) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'elements']
      });
    }

    // Generate new ID
    const lastId = palsData.pals.length > 0
      ? parseInt(palsData.pals[palsData.pals.length - 1].id)
      : 0;
    newPal.id = String(lastId + 1).padStart(3, '0');

    // Add the new pal to the array
    palsData.pals.push(newPal);

    // Write to file
    const filePath = path.join(__dirname, "public", "data", "pals.json");
    fs.writeFileSync(filePath, JSON.stringify(palsData, null, 4), 'utf8');

    res.status(201).json({
      message: 'Pal created successfully',
      pal: newPal
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a pal by ID
app.put('/api/pals/:id', (req, res) => {
  try {
    const palId = req.params.id;
    const updatedData = req.body;

    // Find the pal index
    const palIndex = palsData.pals.findIndex(pal => pal.id === palId);

    if (palIndex === -1) {
      return res.status(404).json({
        error: 'Pal not found',
        message: `No pal found with ID: ${palId}`
      });
    }

    // Keep the same ID, update other fields
    palsData.pals[palIndex] = {
      ...palsData.pals[palIndex],
      ...updatedData,
      id: palId  // Ensure ID doesn't change
    };

    // Write to file
    const filePath = path.join(__dirname, "public", "data", "pals.json");
    fs.writeFileSync(filePath, JSON.stringify(palsData, null, 4), 'utf8');

    res.json({
      message: 'Pal updated successfully',
      pal: palsData.pals[palIndex]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a pal by ID
app.delete('/api/pals/:id', (req, res) => {
  try {
    const palId = req.params.id;

    // Find the pal index
    const palIndex = palsData.pals.findIndex(pal => pal.id === palId);

    if (palIndex === -1) {
      return res.status(404).json({
        error: 'Pal not found',
        message: `No pal found with ID: ${palId}`
      });
    }

    // Remove the pal from the array
    const deletedPal = palsData.pals.splice(palIndex, 1)[0];

    // Write to file
    const filePath = path.join(__dirname, "public", "data", "pals.json");
    fs.writeFileSync(filePath, JSON.stringify(palsData, null, 4), 'utf8');

    res.json({
      message: 'Pal deleted successfully',
      pal: deletedPal
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all elements
app.get('/api/elements', (req, res) => {
  res.json(elementsData);
});

// Get element by name
app.get('/api/elements/:name', (req, res) => {
  try {

    const elements = Object.keys(elementsData);
    console.log(elements);

    let element = elements.find((el) => el.toLowerCase() === req.params.name.toLowerCase());

    if (!element) {
      return res.status(404).json({ error: 'Element not found' });
    }

    return res.json({ name: element, url: elementsData[element] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new element
app.post('/api/elements', (req, res) => {
  try {
    const { name, url } = req.body;

    // Validate required fields
    if (!name || !url) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'url']
      });
    }

    // Check if element already exists
    if (elementsData[name]) {
      return res.status(409).json({
        error: 'Element already exists',
        message: `Element '${name}' already exists`
      });
    }

    // Add the new element
    elementsData[name] = url;

    // Write to file
    const filePath = path.join(__dirname, "public", "data", "elements.json");
    fs.writeFileSync(filePath, JSON.stringify(elementsData, null, 4), 'utf8');

    res.status(201).json({
      message: 'Element created successfully',
      element: { name, url }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an element by name
app.put('/api/elements/:name', (req, res) => {
  try {
    const elementName = req.params.name;
    const { url } = req.body;

    // Validate required fields
    if (!url) {
      return res.status(400).json({
        error: 'Missing required field',
        required: ['url']
      });
    }

    // Check if element exists
    if (!elementsData[elementName]) {
      return res.status(404).json({
        error: 'Element not found',
        message: `No element found with name: ${elementName}`
      });
    }

    // Update the element
    elementsData[elementName] = url;

    // Write to file
    const filePath = path.join(__dirname, "public", "data", "elements.json");
    fs.writeFileSync(filePath, JSON.stringify(elementsData, null, 4), 'utf8');

    res.json({
      message: 'Element updated successfully',
      element: { name: elementName, url }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an element by name
app.delete('/api/elements/:name', (req, res) => {
  try {
    const elementName = req.params.name;

    // Check if element exists
    if (!elementsData[elementName]) {
      return res.status(404).json({
        error: 'Element not found',
        message: `No element found with name: ${elementName}`
      });
    }

    // Store the deleted element's URL
    const deletedUrl = elementsData[elementName];

    // Delete the element
    delete elementsData[elementName];

    // Write to file
    const filePath = path.join(__dirname, "public", "data", "elements.json");
    fs.writeFileSync(filePath, JSON.stringify(elementsData, null, 4), 'utf8');

    res.json({
      message: 'Element deleted successfully',
      element: { name: elementName, url: deletedUrl }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
