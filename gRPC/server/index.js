const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDefinition = protoLoader.loadSync("customer.proto", {});
const proto = grpc.loadPackageDefinition(packageDefinition).CustomerService;

const customers = [
  { id: "1", name: "Shatish D", address: "Surat, India" },
  { id: "2", name: "Mayank P", address: "Mumbai, India" },
  { id: "3", name: "Adil Khan", address: "Riyadh, Saudi Arabia" },
];

function getAll(call, callback) {
  console.log("gRpc  🚀", customers);
  callback(null, { customers });
}

function get(call, callback) {
  const customer = customers.find((c) => c.id === call.request.id);
  if (customer) {
    callback(null, customer);
  } else {
    callback({
      code: grpc.status.NOT_FOUND,
      details: "Customer not found",
    });
  }
}

function insert(call, callback) {
  const newCustomer = call.request;
  customers.push(newCustomer);
  callback(null, newCustomer);
}

function update(call, callback) {
  const existingCustomer = customers.find((c) => c.id === call.request.id);
  if (existingCustomer) {
    Object.assign(existingCustomer, call.request);
    callback(null, existingCustomer);
  } else {
    callback({
      code: grpc.status.NOT_FOUND,
      details: "Customer not found",
    });
  }
}

function remove(call, callback) {
  const customerIndex = customers.findIndex((c) => c.id === call.request.id);
  if (customerIndex !== -1) {
    customers.splice(customerIndex, 1);
    callback(null, {});
  } else {
    callback({
      code: grpc.status.NOT_FOUND,
      details: "Customer not found",
    });
  }
}

function main() {
  const server = new grpc.Server();
  server.addService(proto.service, {
    GetAll: getAll,
    Get: get,
    Insert: insert,
    Update: update,
    Remove: remove,
  });
  server.bindAsync(
    "0.0.0.0:50051",
    grpc.ServerCredentials.createInsecure(),
    () => {
      console.log("gRPC server running on port 50051");
      server.start();
    }
  );
}

main();
