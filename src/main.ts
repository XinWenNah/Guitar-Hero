/**
 * Inside this file you will use the classes and functions from rx.js
 * to add visuals to the svg element in index.html, animate them, and make them interactive.
 *
 * Study and complete the tasks in observable exercises first to get ideas.
 *
 * Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/
 *
 * You will be marked on your functional programming style
 * as well as the functionality that you implement.
 *
 * Document your code!
 */

import "./style.css";

import { fromEvent, interval, merge, of, Observable, Subscription} from "rxjs";
import { map, filter, scan ,delay, take, startWith, switchMap, withLatestFrom, 
mergeMap}  from "rxjs/operators";
import * as Tone from "tone";
import { SampleLibrary } from "./tonejs-instruments";
import {updateView} from "./view"
import type{Key, Action, State} from "./types"
import {Viewport, Constants} from "./types"
import {Tick, updateState, Pressing, reducedState, Holding, initialState, 
    
} from "./state"

export{createSvgElement}

/**
 * Creates an SVG element with the given properties.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/SVG/Element for valid
 * element names and properties.
 *
 * @param namespace Namespace of the SVG element
 * @param name SVGElement name
 * @param props Properties to set on the SVG element
 * @returns SVG element
 */
const createSvgElement = (
    namespace: string | null,
    name: string,
    props: Record<string, string> = {},
) => {
    const elem = document.createElementNS(namespace, name) as SVGElement;
    Object.entries(props).forEach(([k, v]) => elem.setAttribute(k, v));
    return elem;
};

/**
 * This is the function called on page load. Your main game loop
 * should be called here.
 */
export function main(csvContents: string,samples:{[key:string]:Tone.Sampler}) {
    // Canvas elements
    const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
                                                                HTMLElement;

    svg.setAttribute("height", `${Viewport.CANVAS_HEIGHT}`);
    svg.setAttribute("width", `${Viewport.CANVAS_WIDTH}`);

    /** User input */
    const key$ = fromEvent<KeyboardEvent>(document, "keypress");
    const hold$ = fromEvent<KeyboardEvent>(document, "keydown");
    const release$ = fromEvent<KeyboardEvent>(document, "keyup");

    /**
     * Constructing an observable when user presses the correct key(s)
     * @param keyCode 
     * @returns observables
     */
    //Code adopted from Week4 workshop
    const fromKey = (keyCode: Key):Observable<KeyboardEvent> =>
        key$.pipe(
            filter(({ code }) => code === keyCode),
            filter(({repeat})=>!repeat),
        );
    
     /**
     * Constructing an observable when user is holding the correct key(s)
     * Aspired by applied 4,mergeUpDown
     * @param keyCode 
     * @returns observables
     */
    const holdKey = (keyCode: Key, x:String):Observable<Holding> =>{
        return hold$.pipe(
                    filter(({ code }) => code === keyCode),
                    switchMap(()=>of(1).pipe(
                        //Need to delay so the Pressing can be activated 
                        //Else Pressing will always be blocked
                        delay(1),   
                        switchMap(()=>release$.pipe(
                            filter(({ code }) => code === keyCode),
                            take(1),
                            map(()=>new Holding(false,x)),
                            startWith(new Holding(true, x)),
                        ))
                    ))
                )
    }

    /**
     * Return an observable that will only emit true and false if the source$ 
     * happens
     * @param source$ the observable that can trigger by user
     * @param starting starting boolean
     * @returns observable
     */

    const switchOnOff = (source$:Observable<KeyboardEvent|Event>, 
                        starting:boolean):Observable<boolean> =>{
                            return source$.pipe(
                                startWith(false),
                                scan((acc, _)=>!acc, starting)
                            )
    }

    const keyA = fromKey("KeyA").pipe(map(()=>(new Pressing("20%"))))
    const keyS = fromKey("KeyS").pipe(map(()=>(new Pressing("40%"))))
    const keyD = fromKey("KeyD").pipe(map(()=>(new Pressing("60%"))))
    const keyF = fromKey("KeyF").pipe(map(()=>(new Pressing("80%"))))

    const holdA = holdKey ("KeyA","20%")
    const holdS = holdKey ("KeyS","40%")
    const holdD = holdKey ("KeyD","60%")
    const holdF = holdKey ("KeyF","80%")

    const pause$ = switchOnOff(fromKey("KeyP"), true)

    const restart_button = document.getElementById("restart") as HTMLElement;
    const restart$ = switchOnOff(fromEvent(restart_button, "mousedown"), false)


   /**
    * Pre process the csvcontent
    * @param csvText 
    * @returns an array of array
    */
    const preProcessText = (csvText:String):(string|number)[][] => {

        const texts = csvContents.trim().split("\n");
        const desiredTexts = texts.slice(1, texts.length);
        const processedText =  desiredTexts.map((t)=>{
                const   text  = t.split(","),
                        playOrNot   = text[0],
                        instru = text[1],
                        pitch = text[3],
                        velo = text[2],
                        start = Number(text[4]),
                        end = Number(text[5])
                return [instru, pitch, velo, start, end, playOrNot]
            })
        return processedText
    }
    /**
     * Insert a dummy note at the end of the array so the last note has 
    *  time to play the music before game ends
     * @param text processedText
     * @returns text with dummy note
     */
    const insertDummyNote = (text:(string|number)[][]):(string|number)[][] =>{
        return [...text, ["violin","","0",
                            text[text.length-1][4], 
                            String(Number(text[text.length-1][4])), "False"]]
    }
    
    /**
     * Decide the colour based on the pitch
     * @param pitch  Pitch of the note
     * @returns colour
     */
    const decideColour = (pitch:number):string =>{
        return  pitch%4===0?"green":
                pitch%4===1?"red":
                pitch%4===2?"blue":"yellow"
    }

    /**
     * Take the processed text and add the notes and tail to the initial state
     * @param processedText 
     * @returns s state
     */
    const updatedState = (processedText:(string|number)[][]):State => {

        const newState = processedText.reduce((acc, t)=>
            updateState(acc)(String(t[5]),
            decideColour(Number(t[1])), 
            String(t[0]), //userPlay
            String(t[1]), //pitch
            String(t[2]), //velocity
            String(t[3]), //start
            String(t[4]))//end
                        , initialState)
        return newState as State
    }

    const completedText = insertDummyNote(preProcessText(csvContents))

    /**Add the notes and tails to the state*/
    const state = updatedState(completedText)

     /**
     * Updates the state by proceeding with one time step.
     * @param s Current state
     * @returns Updated state
     */
    //Code adopted from Week4 workshop
    const tick$:Observable<Tick> = interval(Constants.TICK_RATE_MS).pipe(
        map((time)=>new Tick(time))
    );

    const action$:Observable<Action> =
    merge(keyA, keyS, keyD, keyF,tick$, holdA, holdS, holdD, holdF)

    const state$ :Observable<State> = action$.pipe(
        withLatestFrom(pause$), // Check the latest value of `pause$`
        filter(([_, flag]) => !flag), // Only emit when `pause$` is false
        scan((acc, [action]) => reducedState(acc, action), state) // Extract the original value
    )

    //It will be actiaved when the user click on the restart button
    //When it is activated, every element will back to their original position
    const restartState$:Observable<State> = restart$.pipe(
        switchMap(()=>state$)
    )
        
    
    const subscription:Subscription = restartState$.subscribe(
        (state)=>updateView(()=>subscription.unsubscribe)(state))

}

// The following simply runs your main function on window load.  Make sure to leave it in place.
// You should not need to change this, beware if you are.
if (typeof window !== "undefined") {
    // Load in the instruments and then start your game!
    const samples = SampleLibrary.load({
        instruments: [
            "bass-electric",
            "violin",
            "piano",
            "trumpet",
            "saxophone",
            "trombone",
            "flute",
        ], // SampleLibrary.list,
        baseUrl: "samples/",
    });

    const startGame = (contents: string) => {
        document.body.addEventListener(
            "mousedown",
            function () {
                    main(contents, samples);
            },
            { once: true },
        );
    };

    const { protocol, hostname, port } = new URL(import.meta.url);
    const baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ""}`;

    Tone.ToneAudioBuffer.loaded().then(() => {
        for (const instrument in samples) {
            samples[instrument].toDestination();
            samples[instrument].release = 0.5;
        }

        fetch(`${baseUrl}/assets/${Constants.SONG_NAME}.csv`)
            .then((response) => response.text())
            .then((text) => startGame(text))
            .catch((error) =>
                console.error("Error fetching the CSV file:", error),
            );
    });
}
