export type{Key, Event, State, Circle, Action, Tail, ViewType, MouseUpDownEvent}
export {Viewport, Constants, Note}

const Viewport = {
    CANVAS_WIDTH: 200,
    CANVAS_HEIGHT: 400,
} as const;

const Constants = {
    TICK_RATE_MS: 20,
    SONG_NAME: "RockinRobin",
    TESTING:"testing",
    TESTING_1:"SleepingBeauty"
} as const;

const Note = {
    RADIUS: 0.07 * Viewport.CANVAS_WIDTH,
    TAIL_WIDTH: 10,
    MOVEMENT: Viewport.CANVAS_HEIGHT / 120
} as const



/** User input */
type Key = "KeyA" | "KeyS" | "KeyD" | "KeyF" |"KeyP";

type Event = "keydown" | "keyup" | "keypress";

type ViewType = "Note"| "Tail"


/**State */
//Code adopted from Week 4 workshop
type State = Readonly<{
    gameEnd: boolean;
    circles:ReadonlyArray<Circle>,//Stores all the user play notes
    exit:ReadonlyArray<Circle|Tail>,//Store all elements need to be removed
    play:ReadonlyArray<Circle|Tail>, //Store the musical note s
                                //which need to be play in that tick 
                                //This array will be refreshed in every tick
                                //Tail is used to know when to stop the music
    score:number,
    objCount:number,
    currentTime:number,//Gmae time, used to indicate which note is movable
    tail:ReadonlyArray<Tail>,//An array that stores all the tails

    //A dynamic array that stores the x position(s)
    //of the button(s) which player is holding
    holding:ReadonlyArray<String>,
    multiplier:number,
    highScore:number,
    background:ReadonlyArray<Circle>,   //Array that stores 
                                        //the background musical notes
    randomValue:number //Random value that is used to choose the random note
}>;

type ObjectId = Readonly<{id: string}>

type MouseUpDownEvent = Readonly<{
    start: boolean;
    element: HTMLElement;
}>;

interface Tail extends ObjectId{
    x1:string,
    y1:string,
    x2:string,
    y2:string,
    stroke:string,//The colour of tail
    width:string,
    start:string,
    end:string,
    viewType:ViewType,
    instrument:string,
    pitch:string,
    
}

interface Circle extends ObjectId{
    r:string,
    cx:string,
    cy:string,
    style:string,
    class:string,
    instrument:string,
    pitch:string,
    velocity:string,
    played:string,//Show this circle needs to go to play array or not
    start:string,
    end:string,
    destY:string,//always 350
    viewType:ViewType,
    hold:string,
}

interface Action {
    apply(s: State): State;
}

