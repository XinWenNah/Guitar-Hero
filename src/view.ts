// Update the view according to the given State.
// All dependencies on SVG and HTML are isolated to this file.
export { updateView}
import { State, Circle, Constants, Tail, ViewType, Viewport} from './types'
import { attr, isNotNullOrUndefined } from './util'
import {createSvgElement} from "./main"
import { SampleLibrary } from "./tonejs-instruments";
import * as Tone from "tone";

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

Tone.ToneAudioBuffer.loaded().then(() => {
    for (const instrument in samples) {
        samples[instrument].toDestination();
        samples[instrument].release = 0.5;
    }})

/**
 * Play the sound 
 * @param samples 
 * @returns void
 */
const playSound = 
    (samples:{ [key: string]: Tone.Sampler }) => (c:Circle):void=> {
    if(c===null)return

    if(c.hold==="false"){//For normal note and background note
            if(samples[c.instrument]){
                samples[c.instrument].triggerAttackRelease(
                    Tone.Frequency(Number(c.pitch), "midi").toNote(),
                    Number(c.end)-Number(c.start),
                    undefined,
                    Number(c.velocity)/127//Normalization, so it is not load
                )
            }
    }else{//For note which has tail
        //Keep playing music until the tail exists in exit array
        //Exist in exit array means player misses the tail or finishes the tail
        //So we can stop playing the music
        samples[c.instrument].triggerAttack(
            Tone.Frequency(Number(c.pitch), "midi").toNote(), 
            undefined, // Use default time for note onset
            // Set velocity to quarter of the maximum velocity
            Number(c.velocity)/127, //Normalization, so it is not load
        );
    }
}

/**
 * Stop the sound
 * @param samples 
 * @returns 
 */
const stopSound = 
    (samples:{ [key:string]: Tone.Sampler })=>(c:Circle|Tail):void =>{
    samples[c.instrument].triggerRelease(
        Tone.Frequency(Number(c.pitch), "midi").toNote(), // Convert MIDI note to frequency
    );
}

    /**
     * Displays a SVG element on the canvas. Brings to foreground.
     * @param elem SVG element to display
     */
    const show = (elem: SVGGraphicsElement) => {
        elem.setAttribute("visibility", "visible");
        elem.parentNode!.appendChild(elem);
    };

    /**
     * Hides a SVG element on the canvas.
     * @param elem SVG element to hide
     */
    const hide = (elem: SVGGraphicsElement) =>
        elem.setAttribute("visibility", "hidden");


/**
 * Update the SVG game view.  
 * 
 * @param onFinish a callback function to be applied when the game ends.  For example, to clean up subscriptions.
 * @param s the current game model State
 * @returns void
 */
//code adopted from Week 4 workshop 
function updateView(onFinish: () => void) {

    return function (s: State):void {

    const   svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
                                                                HTMLElement,
            scoreText = document.querySelector("#scoreText") as HTMLElement,
            gameOver = document.querySelector("#gameOver") as SVGGraphicsElement 
                                                                & HTMLElement,
        
    multiplier = document.querySelector("#multiplierText") as HTMLElement,
    highScoreText = document.querySelector( "#highScoreText") as HTMLElement;
    

    // if those elements are null, exit function early without doing anything
    if (!svg || !scoreText ||!gameOver ||!multiplier || !highScoreText ) return
    
    /**
     * Update the position of every element(tail, note) or add the new element
     * @param rootSVG  the current svg
     * @returns void
     */
    const updateBodyView = (rootSVG: HTMLElement) => (c: Circle|Tail) => {

        /**
         * Create the new html element and set the attributes 
         * @param e movable elements such as circle and tail.
         * @returns html element
         */
        function createNewElement<T extends Circle|Tail>(e:T){
            /**
             * Return the type of the new element 
             * @param viewType 
             * @returns type(circle/line)
             */
            const decideType = (viewType:ViewType)=>{
                return viewType==="Note"?"circle":"line"
            }

            const newElement = createSvgElement(rootSVG.namespaceURI, 
                                                decideType(e.viewType), 
                                                {...e});
            attr(newElement, {...e});

            /**
             * stroke-width, this variable name is unaccepted by typescript.
             * Therefore, i need to set this attribute in updateView
             */
            if(e.viewType === "Tail"){
                const tail = e as Tail;
                newElement.setAttribute("stroke-width", String(tail.width))
            }
            return newElement
        }


        const current = document.getElementById(c.id) || createNewElement(c);
        attr(current, {...c});
        rootSVG.appendChild(current);
    };  
    s
    
    //Play the musical note including the background musical note
    //Check the tail exist in play array or not.
    //Existing in play array means the tail is finished, we need to stop playing
    //the music by calling stopSound function
    s.play.forEach((e)=>{
        if(e.viewType === "Note"){playSound(samples)(e as Circle)}
        else{stopSound(samples)(e)}});
    
    //Update the position of notes and tails
    [...s.circles, ...s.tail].forEach((e)=>updateBodyView(svg)(e));
    
   

    //Remove those missed tails and notes
    [...s.exit, ...s.play].map(c => document.getElementById(c.id))
    .filter(isNotNullOrUndefined)
    .forEach(v => {
        try {
            svg.removeChild(v)

        } catch (e) {
            // rarely it can happen that a bullet can be in exit
            // for both expiring and colliding in the same tick,
            // which will cause this exception
            console.log("Already removed: " + v.id)
        }
    })

    //Update the score, multiplier and high score
    scoreText.textContent = String(s.score)

    multiplier.textContent = String(s.multiplier)

    highScoreText.textContent = String(s.highScore)


    //Check the game ends or not
    //If yes, show the game end and unsubscribe this observables
    if (s.gameEnd) {
        show(gameOver);
        onFinish();
    } else {
        hide(gameOver);
    }
}
}


