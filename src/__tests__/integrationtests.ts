import { createTestElevator } from "./unittests";

test("Elevator moves to bottom floor and opens the doors", () => {
    let { elevator, callPanels } = createTestElevator({
        currentFloor: 4,
        floorCount: 8
    });
    elevator.setToMaintenance();
    expect(elevator.getMessage()).toEqual("On maintenance.");

    callPanels[0].clickUp(); // Someone on the floor 0 clicks call panel "up"
    expect(elevator.getMessage()).toEqual("On maintenance.");
});

test("Elevator moves to bottom floor and opens the doors", () => {
    let { elevator, callPanels } = createTestElevator({
        currentFloor: 4,
        floorCount: 8
    });
    expect(elevator.getMessage()).toEqual("Standing at floor 4. Doors are closed.");
    callPanels[0].clickUp(); // Someone on the floor 0 clicks call panel "up"
    expect(elevator.getMessage()).toEqual("Going down, on floor 4. Doors are closed.");
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Going down, on floor 3. Doors are closed.");
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Going down, on floor 2. Doors are closed.");
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Going down, on floor 1. Doors are closed.");
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Standing at floor 0. Doors are closed.");
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Standing at floor 0. Doors are open.");
});

test("Elevator goes from bottom floor to 3rd floor", () => {
    let { elevator, callPanels } = createTestElevator({
        currentFloor: 0,
        floorCount: 8
    });
    expect(elevator.getMessage()).toEqual("Standing at floor 0. Doors are closed.");
    callPanels[0].clickUp(); // Someone on the floor 0 clicks call panel "up"
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Standing at floor 0. Doors are open.");
    elevator.clickFloor(3);
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Going up, on floor 0. Doors are closed.");
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Going up, on floor 1. Doors are closed.");
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Going up, on floor 2. Doors are closed.");
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Standing at floor 3. Doors are closed.");
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Standing at floor 3. Doors are open.");
});

test("Travels from 0 to 6th and picks up someone on floor 3th going to 5th", () => {
    let { elevator, callPanels } = createTestElevator({
        currentFloor: 0,
        floorCount: 8
    });

    // Initially the elevator is at
    expect(elevator.getMessage()).toEqual("Standing at floor 0. Doors are closed.");

    // Someone on the floor 0 clicks call panel "up"
    callPanels[0].clickUp();

    elevator.testProgress();

    expect(elevator.getMessage()).toEqual("Standing at floor 0. Doors are open.");

    // Person at the 0th floor stood in while the doors were open and clicked floor 6
    elevator.clickFloor(6);

    // Someone on the floor 3 clicks call panel "up"
    callPanels[3].clickUp();

    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Going up, on floor 0. Doors are closed.");
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Going up, on floor 1. Doors are closed.");
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Going up, on floor 2. Doors are closed.");
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Going up, on floor 3. Doors are closed.");
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Going up, on floor 3. Doors are open.");

    // Person on the 3rd floor stood in and clicked 5th floor
    elevator.clickFloor(5);

    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Going up, on floor 3. Doors are closed.");
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Going up, on floor 4. Doors are closed.");
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Going up, on floor 5. Doors are closed.");
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Going up, on floor 5. Doors are open.");
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Going up, on floor 5. Doors are closed.");
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Standing at floor 6. Doors are closed.");
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Standing at floor 6. Doors are open.");
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Standing at floor 6. Doors are closed.");
});

test("Someone travels from 3 to 0", () => {
    let { elevator, callPanels } = createTestElevator({
        currentFloor: 0,
        floorCount: 8
    });

    // Initially the elevator is at
    expect(elevator.getMessage()).toEqual("Standing at floor 0. Doors are closed.");

    // Someone on the floor 3 clicks call panel "up"
    callPanels[3].clickUp();

    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Going up, on floor 1. Doors are closed.");
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Going up, on floor 2. Doors are closed.");
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Standing at floor 3. Doors are closed.");
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Standing at floor 3. Doors are open.");

    // Someone on floor 3 hops in and clicks floor 0
    elevator.clickFloor(0);

    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Going down, on floor 3. Doors are closed.");
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Going down, on floor 2. Doors are closed.");
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Going down, on floor 1. Doors are closed.");
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Standing at floor 0. Doors are closed.");
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Standing at floor 0. Doors are open.");
    elevator.testProgress();
    expect(elevator.getMessage()).toEqual("Standing at floor 0. Doors are closed.");
});
