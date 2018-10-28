import { Elevator, ElevatorController, Screen, CallPanel } from "../elevator";

class MockElevator extends Elevator {
    public testFloorChanges: number[] = [];

    public testGetMoveSet() {
        return this.movingToFloors;
    }

    public testGetCurrentFloor() {
        return this.currentFloor;
    }

    public testGetFloorCount() {
        return this.floorCount;
    }

    public testIsGoingDown() {
        return this.isGoingDown();
    }

    public testIsGoingUp() {
        return this.isGoingUp();
    }

    public testProgress() {
        this.progress();
    }

    protected increaseFloor() {
        super.increaseFloor();
        this.testFloorChanges.push(this.currentFloor);
    }

    protected decreaseFloor() {
        super.decreaseFloor();
        this.testFloorChanges.push(this.currentFloor);
    }
}

class MockElevatorController extends ElevatorController {
    public testGetEvents() {
        return this.elevatorEvents;
    }
}

/**
 * Create test elevator and controller
 *
 * 8 floors total, current floor by default is 4th
 */
export const createTestElevator = (
    { currentFloor, floorCount } = { currentFloor: 4, floorCount: 8 }
) => {
    let floors = [...Array(floorCount).map((_, i) => i)];
    let controller = new MockElevatorController();
    let elevator = new MockElevator(controller, currentFloor, floors.length);
    let callPanels = floors.map(() => new CallPanel());
    let screens = floors.map(() => new Screen());

    // Add elevator to controller
    controller.addElevator(elevator);

    // Add elevator screens for each floor
    controller.addElevatorScreens(elevator, screens);

    // Add one callpanel for each floor
    callPanels.forEach((panel, floor) => controller.addCallPanel(floor, panel));

    return {
        floors: floors,
        controller: controller,
        screens: screens,
        callPanels: callPanels,
        elevator: elevator
    };
};

test("Init", () => {
    let { elevator } = createTestElevator();
    expect(elevator.testGetCurrentFloor()).toEqual(4);
    expect(elevator.testGetFloorCount()).toEqual(8);
    expect(elevator.getMessage()).toEqual("Standing at floor 4. Doors are closed.");
});

test("Elevator move up", () => {
    // TODO: This should just create elevator, but what ever
    let { elevator } = createTestElevator();
    let canMove = elevator.moveToFloor(5);
    expect(canMove).toBeTruthy();
    expect(elevator.testIsGoingUp()).toBeTruthy();
    expect(elevator.testIsGoingDown()).toBeFalsy();
});

test("Elevator move down", () => {
    // TODO: This should just create elevator, but what ever
    let { elevator } = createTestElevator();
    let canMove = elevator.moveToFloor(3);
    expect(canMove).toBeTruthy();
    expect(elevator.testIsGoingUp()).toBeFalsy();
    expect(elevator.testIsGoingDown()).toBeTruthy();
});

test("Elevator going down, can't turn around and go up", () => {
    // TODO: This should just create elevator, but what ever
    let { elevator } = createTestElevator();
    elevator.moveToFloor(3);
    expect(elevator.testIsGoingDown()).toBeTruthy();

    let canMove = elevator.moveToFloor(5);
    expect(canMove).toBeFalsy();
});

test("Elevator going up, can't turn around and go down", () => {
    // TODO: This should just create elevator, but what ever
    let { elevator } = createTestElevator();
    elevator.moveToFloor(5);
    expect(elevator.testIsGoingUp()).toBeTruthy();
    expect(elevator.moveToFloor(3)).toBeFalsy();
});

test("Elevator going down, can do a stop between", () => {
    // TODO: This should just create elevator, but what ever
    let { elevator } = createTestElevator();
    expect(elevator.moveToFloor(0)).toBeTruthy();
    expect(elevator.moveToFloor(2)).toBeTruthy();
});

test("Elevator going up, can do a stop between", () => {
    // TODO: This should just create elevator, but what ever
    let { elevator } = createTestElevator();
    expect(elevator.moveToFloor(7)).toBeTruthy();
    expect(elevator.moveToFloor(5)).toBeTruthy();
});

test("Elevator move to same floor", () => {
    // TODO: This should just create elevator, but what ever
    let { elevator } = createTestElevator();
    expect(elevator.moveToFloor(4)).toBeTruthy();
    expect(elevator.testIsGoingUp()).toBeFalsy();
    expect(elevator.testIsGoingDown()).toBeFalsy();
});

test("Elevator which isn't operational, doesn't move", () => {
    // TODO: This should just create elevator, but what ever
    let { elevator } = createTestElevator();
    elevator.setToMaintenance();
    expect(elevator.moveToFloor(5)).toBeFalsy();
});

test("Panel click up from bottom floor creates event", () => {
    let { elevator, controller, callPanels } = createTestElevator();

    // Click up button from a bottom floor call panel
    callPanels[0].clickUp();

    let events = controller.testGetEvents();
    expect(events[0].isHandled()).toBeTruthy();
    expect(elevator.testIsGoingDown()).toBeTruthy();
});

test("Panel click down on first floor creates event", () => {
    let { elevator, controller, callPanels } = createTestElevator();

    // Click down button from firsth floor call panel
    callPanels[1].clickDown();

    let events = controller.testGetEvents();
    expect(events[0].isHandled()).toBeTruthy();
    expect(elevator.testIsGoingDown()).toBeTruthy();
});
