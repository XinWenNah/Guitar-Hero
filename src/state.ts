import type {Action, State, Circle} from "./types"
import {Viewport, Note, Tail, Constants} from "./types"
import{RNG} from "./util"

export {Tick, updateState, Pressing, reducedState, Holding, initialState}


const initialState: State = {
    gameEnd: false,
    circles:[],
    exit:[],
    score:0,
    objCount:0,
    play:[],
    currentTime:0,
    tail:[],
    holding:[],
    multiplier:1,
    highScore:0,
    background:[],
    randomValue:0.01//Used for RNG class
} as const;

const lineProps = {//The basic properties of tail object
    x1:"60%",
    y1:"",
    x2:"60%",
    y2:"0",
    stroke:"",
    width:String(Note.TAIL_WIDTH),
    id:"0",
    start:"0",
    end:"0",
    viewType:"Tail",
    instrument:"",
    pitch:""
  } as Tail
  
const circleProps =  {//The basic properties of note object
    r: `${Note.RADIUS}`,
    cx: "20%",
    cy: "-15",
    style: "fill: green",
    class: "shadow",
    instrument:"",
    pitch:"0",
    velocity:"0",
    played:"false",
    start:"0",
    end:"0",
    id: String(initialState.objCount),
    destY:"350",
    viewType:"Note",
    hold:"false"
} as Circle 




/**
 * Decide the x position of the note base on the color
 * @param colour The coolour of the note
 * @returns number The x position 
 */
const colour_to_cx =(colour:String):number => 
    colour ==="green"?20:
    colour ==="red"?40:
    colour === "blue"?60:
    colour === "yellow"?80:0


/**
 * Update the state by adding the notes(including background) and tails
 * @param s old state
 * @param  userPlay The boolean variable to differentiate the background note from normal note
 * @param colour The colour of the note
 * @param pitch 
 * @param velocity
 * @param start
 * @param end
 * @returns s new state
 */

const updateState = (s:State) => 
        (userPlay:String, 
        colour:String, 
        instrument:String,
        pitch:String, 
        velocity:String, 
        start:String, 
        end:String):State =>{
        const newBackground = userPlay==="False"?[...s.background, {
                                            ...circleProps,
                                            cx:String(colour_to_cx(colour))+"%", 
                                            style:"fill: "+colour, 
                                            instrument:String(instrument),
                                            pitch:String(pitch), 
                                            velocity:String(velocity), 
                                            start:String(start),
                                            end:String(end),
                                            id:"b"+String(s.objCount+1),
                                            }]:[...s.background]

        const newCircles = userPlay==="True"?[...s.circles,{
                            ...circleProps, 
                            cx:String(colour_to_cx(colour))+"%", 
                            style:"fill: "+colour, 
                            instrument:String(instrument),
                            pitch:String(pitch), 
                            velocity:String(velocity), 
                            start:String(start),
                            end:String(end),
                            id:"c"+String(s.objCount+1),
                            hold:Number(end)-Number(start) < 1?"false":"true"}]
                            :[...s.circles]

        const newTail = userPlay==="True"&&Number(end)-Number(start) >= 1?
                                        [...s.tail, {  ...lineProps,
                                        x1:String(colour_to_cx(colour))+"%",
                                        /**
                                         * Formula for calculating the length of
                                         * tail
                                         * 
                                         * (end-start)*NOTE.MOVEMENT*49.3
                                         * Reason of multiplying -1 is let this 
                                         * tail appear outside the screen, so 
                                         * player will not see it.
                                         * 
                                         * Reason of minusing Note.RADIUS/2 is
                                         * let the beginning of the tail
                                         * at the half of the note
                                         * 
                                         */
                                        y1:String((Number(end)-Number(start))
                                                            *49.3
                                                            *Note.MOVEMENT*(-1)-
                                                            Note.RADIUS/2),
                                        y2:String(Note.RADIUS/2*(-1)),
                                        x2:String(colour_to_cx(colour))+"%",
                                        stroke:String(colour),
                                        id:"t"+String(s.objCount+1),
                                        start:String(Number(start)),
                                        end:String(Number(end) ),
                                        instrument:String(instrument),
                                        pitch:String(pitch), 
                                                            }]:[...s.tail]
            
        return {
            ...s,
            objCount:s.objCount+1,
            background:newBackground,
            circles:newCircles,
            tail:newTail
        } as State
}

//Code adopted from Week4 workshop
class Tick implements Action {

    constructor(public readonly elapsed: number) {this.elapsed = elapsed }
    /** 
     * interval tick: note and tail moves, missed tail and note
     * @param s old State
     * @returns new State
     */
    apply(s: State): State {

        //Update the positions of all circles
        const newCircles = s.circles.map((c)=>Tick.moveBodyCircle(c,s))

        //Update the positions of all tails
        const newTail = s.tail.map((t)=>Tick.moveBodyTail(t,s))

        //Update the positions of all background notes
        const newBackground = s.background.map((c)=>Tick.moveBodyCircle(c, s))

        /**
         * Check all the notes arrays are emtpy or not
         * EMpty means game end
         */
        const endOrNot = s.background.length 
                        +s.circles.length
                        +s.play.length
                        +s.tail.length === 0
        
        return Tick.filterElement({...s, 
                                    circles:newCircles, 
                                    tail:newTail, 
                                    background:newBackground, 
                                    gameEnd:endOrNot})
    }
    
    /** 
     * Move the circles
     * @param c Circle/Note
     * @paaram s Current state
     * @returns the moved State
     */


    
    //The delay time will be 2s, time it takes for moving down is 2.41 second
    static moveBodyCircle = (c: Circle, s:State): Circle => ({
        ...c,
        cy: s.currentTime >= Number(c.start)?
            String(Number(c.cy)+Note.MOVEMENT):
            c.cy
    })

    /** 
     * Move the tails
     * @param t tail
     * @paaram s Current state
     * @returns the moved State
     */

    static moveBodyTail = (t: Tail, s:State): Tail => {
    return {
            ...t,
            y1:  s.currentTime >= Number(t.start)?
                String(Number(t.y1)+Note.MOVEMENT):
                t.y1,
            y2: s.currentTime >= Number(t.start)?
                s.holding.filter((h)=>h===t.x1).length===0?
                String(Number(t.y2)+Note.MOVEMENT):
                Number(t.y2)<350?
                String(Number(t.y2)+Note.MOVEMENT):
                t.y2:t.y2
    }
}
    /** 
     * Filter out those missed notes(including background notes) and tails
     * @param s Game State
     * @returns a new State
     */
    static filterElement = (s: State): State => {
        
    const remainCircle =
     s.circles.filter((circle)=>Number(circle.cy) < Viewport.CANVAS_HEIGHT-5);

    const missedCircle = 
    s.circles.filter((circle)=>Number(circle.cy) >= Viewport.CANVAS_HEIGHT-5);

    const remainTail = 
    s.tail.filter((t)=>Number(t.y2) < Viewport.CANVAS_HEIGHT-5);

    const missedTail = 
    s.tail.filter((t)=>Number(t.y2) >= Viewport.CANVAS_HEIGHT-5 || 
                                        Number(t.y1) >= Number(t.y2));

    const playedBackground = s.background.filter((c)=>Number(c.cy)>=350)

    const notPlayedBackground = s.background.filter((c)=>Number(c.cy)<350)
        
    return {
        ...s,
        circles:remainCircle,
        exit:[...s.exit, ...missedCircle, ...missedTail],
        currentTime:s.currentTime+0.02,
        play:[...playedBackground],
        tail:remainTail,
        score:s.score - missedTail.length - missedCircle.length<=0?0:
                        s.score - missedTail.length - missedCircle.length,
        multiplier:missedTail.length + missedCircle.length >0?1:s.multiplier,
        highScore:s.highScore<s.score?s.score:s.highScore,
        background:[...notPlayedBackground]
    }
    }
}

class Pressing implements Action{

    constructor(public readonly dest_x:string){
        this.dest_x = dest_x;
    }
    /** 
     * Move those notes which are played correctly to play array, calculating the score and multiplier
     * If no note is played correctly, choose a random note from background array and circle array
     * 
     * @param s old State
     * @returns new State
     */
    apply = (s:State):State =>{

        if(s.holding.filter((h)=>h===this.dest_x).length===0)//If user is not holding the key
        {
        //Update the aatirbute of notes which are played correctly
        const Circles = s.circles.map((c)=>
            Pressing.checkInRange(Number(c.cy), 15, Number(c.destY))&&
            c.cx===this.dest_x?{...c, played:"true"} as Circle:{...c})

        const playedCircles = Circles.filter((c)=>c.played==="true");

        const notplayedCircles = Circles.filter((c)=>c.played==="false")
        
        //Calculating how many notes are played successfully
        const numCountSucc = Circles.reduce((acc, c)=>c.played==="true"?acc+1:
                                                                        acc, 0)

        //Construct a random array to choose a random note                                                               
        const randomArray = [...Circles, ...s.background]
        //If no notes are played correctly, choose a random note and set its
        //start to 0, end to 0-0.5
        const newPlay = numCountSucc === 0?
        [{...randomArray[Math.floor(RNG.random(RNG.hash(s.randomValue), 0, 
                                                    randomArray.length-1))], 
        start:"0", 
        end:String(RNG.random(RNG.hash(s.randomValue), 0, 0.5)),
        hold:"false"} as Circle]:playedCircles
        
        return {...s,
                score:numCountSucc===0?
                                s.score===0?0:s.score-1
                                :s.score+1*s.multiplier,
                circles:notplayedCircles, 
                play:[...s.play, ...newPlay],   
                multiplier:numCountSucc === 0?1:1 + 
                                            0.2*Math.floor((s.multiplier+1)/10), 
                randomValue:RNG.hash(s.randomValue)}
        }
        return s//Return the original state is the user is holding this column's key
    }

    /** 
     * Check the current position of notes is inside the accepted range or not
     * @param posNote The y position of the note
     * @param range The accepted range around the posButton
     * @param psoButton The y position of the button
     * @returns boolean
     */
    static checkInRange = (posNote:number, range:number, 
        posButton:number):Boolean =>{
        const max = posButton + range;
        const min = posButton - range;
        return min < posNote && posNote < max
    }
}


class Holding implements Action{

    constructor(public readonly bool:boolean, public readonly x:String)
    {this.bool=bool; this.x=x}

    /** 
     * Filter out those missed notes(including background notes) and tails
     * @param s Game State
     * @returns a new State
     */
    apply = (s:State):State =>{
        
        const newHolding = this.bool?   
        s.holding.filter((h)=>h===this.x).length===0?[...s.holding,this.x]://User is holding but the position of key is not inside holding array
                                        
        s.holding://User is holding and this column's key is inside the holding array
                                   
        s.holding.filter((h)=>h!==this.x)//User is not holding,fiilter out 

        const newTail = s.tail.map((t)=>Pressing.checkInRange(
                                        Number(t.y2),10,350)&&t.x1 === this.x?
                                        {...t, y2:"350", playing:"true"}:{...t})
        //The tails that played correctly
        //If the player holding for correct duration, y1 will greater or equal to y2
        //Because y2 is not moving while y1 is.
        const finishedTail = newTail.filter((t)=>Number(t.y1)>=Number(t.y2))

        const unfinishedTail = newTail.filter((t)=>Number(t.y1) < Number(t.y2))
        
        return {...s, 
                holding:newHolding, 
                tail:unfinishedTail, 
                exit:[...s.exit], 
                play:[...finishedTail],
                score:s.score+10*s.multiplier*finishedTail.length,
                multiplier:finishedTail.length===0?1:s.multiplier}
    }
}

/**
 * Accumulate the state 
 * @param s old state
 * @param action 
 * @returns new state
 */
//Code adopted from Week4 workshop
const reducedState = (s: State, action: Action) =>{
    return action.apply(s);
};