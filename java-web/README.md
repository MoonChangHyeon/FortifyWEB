# Java Web Example

This is a minimal Java web application using the built-in HTTP server.

## Build and Run

To compile and start the server:

```bash
cd java-web
gradle run
```

By default the server listens on port `8080`. If that port is unavailable, you
can specify a different one either via a command line argument or the `PORT`
environment variable:

```bash
gradle run --args='9090'
# or
PORT=9090 gradle run
```

Then open <http://localhost:8080/> (replace `8080` with the port you chose) in
your browser. You should see a greeting message.
