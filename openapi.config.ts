const { generateService } = require("@umijs/openapi")

generateService({
    requestLibPath: "import request from 'lib/request.ts'",
    schemaPath: "http://localhost:8081/api/v3/api-docs/default",
    serversPath: "./",
})
