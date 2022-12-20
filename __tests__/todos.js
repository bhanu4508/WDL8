const request = require("supertest");

const db = require("../models/index");
const app = require("../app");

let server, agent;

describe("Todo_Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Creates_a_todo_and_responds_with_json_at_/todos_POST_endpoint", async () => {
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    expect(response.statusCode).toBe(200);
    expect(response.header["content-type"]).toBe(
      "application/json; charset=utf-8"
    );
    const parsedResponse = JSON.parse(response.text);
    expect(parsedResponse.id).toBeDefined();
  });

  test("Marks_a_todo_with_the_given_ID_as_complete", async () => {
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    const parsedResponse = JSON.parse(response.text);
    const todoID = parsedResponse.id;

    expect(parsedResponse.completed).toBe(false);

    const markCompleteResponse = await agent
      .put(`/todos/${todoID}/markASCompleted`)
      .send();
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });

  test("Fetches_all_todos_in_the_database_using_/todos_endpoint", async () => {
    await agent.post("/todos").send({
      title: "Buy xbox",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    await agent.post("/todos").send({
      title: "Buy ps3",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    const response = await agent.get("/todos");
    const parsedResponse = JSON.parse(response.text);

    expect(parsedResponse.length).toBe(4);
    expect(parsedResponse[3]["title"]).toBe("Buy ps3");
  });

  test("Deletes_a_todo_with_the_given_ID_if_it_exists_and_sends_a_boolean_response", async () => {
    // FILL IN YOUR CODE HERE
    const response = await agent.post("/todos").send({
      title: "Buy notes",
      dueDate: new Date().toISOString(),
      completed: false,
    });

    const parseResponse = JSON.parse(response.text);
    const todoID = parseResponse.id;

    const deleteResponse = await agent.delete(`/todos/${todoID}`).send();
    const parsedDeleteResponse = JSON.parse(deleteResponse.text);
    expect(parsedDeleteResponse).toBe(true);
  });
});
