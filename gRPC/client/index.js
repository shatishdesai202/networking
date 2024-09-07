const express = require("express");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

// Load the protobuf
const packageDefinition = protoLoader.loadSync("customer.proto", {});
const CustomerService =
  grpc.loadPackageDefinition(packageDefinition).CustomerService;

// Create gRPC client
const client = new CustomerService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

const app = express();
app.use(express.json());

// Get all customers
app.get("/customers", (req, res) => {
  client.GetAll({}, (error, response) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(response.customers);
  });
});

// Get a customer by ID
app.get("/customers/:id", (req, res) => {
  const id = req.params.id;
  client.Get({ id }, (error, customer) => {
    if (error) {
      return res.status(404).json({ error: error.details });
    }
    res.json(customer);
  });
});

// Insert a new customer
app.post("/customers", (req, res) => {
  const { id, name, address } = req.body;
  client.Insert({ id, name, address }, (error, customer) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(customer);
  });
});

// Update an existing customer
app.put("/customers/:id", (req, res) => {
  const id = req.params.id;
  const { name, address } = req.body;
  client.Update({ id, name, address }, (error, customer) => {
    if (error) {
      return res.status(404).json({ error: error.details });
    }
    res.json(customer);
  });
});

// Remove a customer
app.delete("/customers/:id", (req, res) => {
  const id = req.params.id;
  client.Remove({ id }, (error) => {
    if (error) {
      return res.status(404).json({ error: error.details });
    }
    res.status(204).send();
  });
});

// Start Express server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
