/**
 * Interface to listen the elevator events
 */
interface ElevatorListener {
    onArrivingFloor(elevator: Elevator, floor: number): void;
    onBecomingFree(elevator: Elevator): void;
    onChangeDoors(elevator: Elevator, floor: number, doorsAreOpen: boolean): void;
    onChangeState(elevator: Elevator, isOperational: boolean): void;
    onChangeFloor(elevator: Elevator, newFloor: number): void;
}

/**
 * Elevator
 */
export class Elevator {
    protected floorCount: number = 0;
    protected currentFloor: number = 0;
    protected movingToFloors: Set<number> = new Set();
    protected onMaintenance = false;
    protected doorsAreOpen = false;

    /** Public interface */

    /**
     * Create elevator
     */
    constructor(private listener: ElevatorListener, currentFloor: number, floorCount: number) {
        this.floorCount = floorCount;
        this.currentFloor = currentFloor;
    }

    /**
     * Sets the elevator to maintenance
     */
    public setToMaintenance() {
        this.onMaintenance = true;
    }

    /**
     * Is the elevator on maintenance?
     */
    public isOnMaintenance() {
        return this.onMaintenance;
    }

    /**
     * Is the elevator free?
     */
    public isFree() {
        // Elevator is free if it's not scheduled to go anywhere and the doors are closed
        if (this.movingToFloors.size == 0 && !this.doorsAreOpen) {
            return true;
        }
        return false;
    }

    /**
     * Move to floor
     *
     * @param floor
     * @returns On success true, otherwise false
     */
    public moveToFloor(floor: number): boolean {
        if (this.canMoveToFloor(floor)) {
            this.movingToFloors.add(floor);
            return true;
        }
        return false;
    }

    /**
     * Click the floor button inside
     *
     * @param floor
     */
    public clickFloor(floor: number) {
        // This discards clicks to the wrong button
        //
        // E.g. if you click floor number above the current floor when the
        // elevator goes down, the click is simply discarded
        this.moveToFloor(floor);
    }

    /**
     * Get message
     */
    public getMessage() {
        if (this.isOnMaintenance()) {
            return "On maintenance.";
        }
        let doors = `Doors are ${this.doorsAreOpen ? "open" : "closed"}.`;

        if (this.isGoingDown()) {
            return `Going down, on floor ${this.currentFloor}. ${doors}`;
        } else if (this.isGoingUp()) {
            return `Going up, on floor ${this.currentFloor}. ${doors}`;
        }
        return `Standing at floor ${this.currentFloor}. ${doors}`;
    }

    /** Private interface */

    /**
     * Attempts to give elevator a command from outside to go to floor
     *
     * @param floor Floor number
     * @returns True if the attempt is accepted
     */
    private canMoveToFloor(floor: number): boolean {
        if (this.isOnMaintenance()) {
            return false;
        }

        // Don't throw the passanger to abyss nor heaven
        if (floor >= this.floorCount) {
            return false;
        } else if (floor < 0) {
            return false;
        }

        // Elevator is not scheduled to go anywhere
        if (this.movingToFloors.size == 0) {
            return true;
        }

        // Is already moving to that floor eventually
        if (this.movingToFloors.has(floor)) {
            return true;
        }

        if (this.currentFloor < floor && this.isGoingUp()) {
            // Is below the wanted floor *and* going up
            return true;
        } else if (this.currentFloor > floor && this.isGoingDown()) {
            // Is above the wanted floor *and* going down
            return true;
        } else if (this.currentFloor == floor) {
            // Happens to be on the same floor!
            return true;
        }
        return false;
    }

    /**
     * Is going down?
     */
    protected isGoingDown() {
        if (this.movingToFloors.size == 0) return false;
        let minFloorToGo = Math.min(...this.movingToFloors);
        return minFloorToGo < this.currentFloor;
    }

    /**
     * Is going up?
     */
    protected isGoingUp() {
        if (this.movingToFloors.size == 0) return false;
        let maxFloorToGo = Math.max(...this.movingToFloors);
        return maxFloorToGo > this.currentFloor;
    }

    /**
     * Simulate progress
     */
    protected progress() {
        if (this.doorsAreOpen) {
            this.closeDoors();

            // When doors close, and it's still not scheduled to go anywhere, the elevator becomes
            // free
            if (this.isFree()) {
                this.listener.onBecomingFree(this);
            }
            return; // Door change causes progress step
        }

        let goesUp = this.isGoingUp();
        let goesDown = this.isGoingDown();

        if (this.movingToFloors.has(this.currentFloor)) {
            this.movingToFloors.delete(this.currentFloor);
            this.listener.onArrivingFloor(this, this.currentFloor);
            if (!this.doorsAreOpen) {
                this.openDoors();
                return; // Door change causes progress step
            }
        }

        if (goesUp && this.canMoveToFloor(this.currentFloor + 1)) {
            this.increaseFloor();
            this.listener.onChangeFloor(this, this.currentFloor);
        } else if (goesDown && this.canMoveToFloor(this.currentFloor - 1)) {
            this.decreaseFloor();
            this.listener.onChangeFloor(this, this.currentFloor);
        }
    }

    protected openDoors() {
        this.doorsAreOpen = true;
    }

    protected closeDoors() {
        this.doorsAreOpen = false;
    }

    protected increaseFloor() {
        this.currentFloor++;
    }

    protected decreaseFloor() {
        this.currentFloor--;
    }
}

/**
 * Abstract class for all elevator events, raised by the buttons
 */
abstract class ElevatorEvent {
    private handled: Date | undefined;

    constructor(private created: Date, private elevator: Elevator | undefined = undefined) {}

    public setElevator(elevator: Elevator) {
        this.elevator = elevator;
    }

    public getCreated() {
        return this.created;
    }

    public isHandled() {
        return !!this.handled;
    }

    public handle() {
        this.handled = new Date();
    }
}

/**
 * When someone on the floor pushes the button outside the elevator
 */
class EventSomeoneOnFloorWantsUp extends ElevatorEvent {
    constructor(private floor: number) {
        super(new Date());
    }

    public getFloor() {
        return this.floor;
    }
}

/**
 * When someone on the floor pushes the button outside the elevator
 */
class EventSomeoneOnFloorWantsDown extends ElevatorEvent {
    constructor(private floor: number) {
        super(new Date());
    }

    public getFloor() {
        return this.floor;
    }
}

/**
 * Interface for commands
 */
interface Command {
    execute(): void;
}

/**
 * Command executed when user presses the callpanel up
 */
class CommandUp implements Command {
    constructor(private controller: ElevatorController, private floor: number) {}
    execute() {
        this.controller.addElevatorEvent(new EventSomeoneOnFloorWantsUp(this.floor));
    }
}

/**
 * Command executed when user presses the callpanel down
 */
class CommandDown {
    constructor(private controller: ElevatorController, private floor: number) {}
    execute() {
        this.controller.addElevatorEvent(new EventSomeoneOnFloorWantsDown(this.floor));
    }
}

/**
 * The call panel, outside the elevator
 *
 * This panel contains up and down buttons
 */
export class CallPanel {
    private upCommand: Command | undefined;
    private downCommand: Command | undefined;

    public setClickUpCommand(command: Command) {
        this.upCommand = command;
    }

    public setClickDownCommand(command: Command) {
        this.downCommand = command;
    }

    public clickUp() {
        if (this.upCommand) this.upCommand.execute();
    }

    public clickDown() {
        if (this.downCommand) this.downCommand.execute();
    }
}

/**
 * Controls one or more elevators and delegates events for elevators available
 */
export class ElevatorController implements ElevatorListener {
    private screensByElevator: Map<Elevator, Screen[]> = new Map();
    private floorsByCallPanel: Map<CallPanel, number> = new Map();
    private elevators: Elevator[] = [];
    protected elevatorEvents: ElevatorEvent[] = [];

    /**
     * Add elevator
     *
     * @param elevator
     */
    public addElevator(elevator: Elevator) {
        this.elevators.push(elevator);
    }

    /**
     * Add a elevator screen
     *
     * @param elevator
     * @param screens
     */
    public addElevatorScreens(elevator: Elevator, screens: Screen[]) {
        // TODO: Just add don't set, maybe in future...
        this.screensByElevator.set(elevator, screens);
    }

    /**
     * Adds a call panel to given floor
     *
     * @param floor
     * @param panel
     */
    public addCallPanel(floor: number, panel: CallPanel) {
        panel.setClickDownCommand(new CommandDown(this, floor));
        panel.setClickUpCommand(new CommandUp(this, floor));
        this.floorsByCallPanel.set(panel, floor);
    }

    /**
     * Queues event for the elevators
     *
     * @param event
     */
    public addElevatorEvent(event: ElevatorEvent) {
        this.elevatorEvents.push(event);
        this.handleEvent(event);
    }

    /**
     * Handle the event
     * @param event
     */
    public handleEvent<T extends ElevatorEvent>(event: T) {
        // JS can't do operator overloading based on the class, but it can do the same thing in guards
        if (
            event instanceof EventSomeoneOnFloorWantsUp ||
            event instanceof EventSomeoneOnFloorWantsDown
        ) {
            for (const elevator of this.elevators) {
                if (elevator.moveToFloor(event.getFloor())) {
                    event.setElevator(elevator);
                    event.handle();
                    break;
                }
            }

            if (!event.handled) {
            }
        }
    }

    /** ElevatorListener interface  */

    public onArrivingFloor(elevator: Elevator, floor: number): void {
        this.updateScreensByElevator(elevator);
    }

    public onChangeState(elevator: Elevator, isOperational: boolean): void {
        this.updateScreensByElevator(elevator);
    }

    public onChangeFloor(elevator: Elevator, newFloor: number): void {
        this.updateScreensByElevator(elevator);
    }

    public onChangeDoors(elevator: Elevator, floor: number, doorsAreOpen: boolean) {
        this.updateScreensByElevator(elevator);
    }

    public onBecomingFree(elevator: Elevator) {
        this.delegateEvents();
    }

    /** Private */
    private getUnhandledEvents() {
        return this.elevatorEvents.filter(f => !f.isHandled());
    }

    private updateScreensByElevator(elevator: Elevator) {
        let screens = this.screensByElevator.get(elevator);
        if (screens) {
            screens.forEach(s => s.setText(elevator.getMessage()));
        }
    }

    private delegateEvents() {
        this.getUnhandledEvents().forEach(e => {
            this.handleEvent(e);
        });
    }

    /** Simulate progress */
    protected progress() {}
}

/**
 * Any kind of screen that can show a message
 */
export class Screen {
    private text = "";

    public setText(text: string) {
        this.text = text;
    }

    public getText() {
        return this.text;
    }
}
