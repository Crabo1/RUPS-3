import { useState, useMemo } from 'react';
import { Button } from 'flowbite-react';
import { get } from 'http';

export interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    image?: string;
    explanation?: string,
    correctAnswer: number;
}

interface QuizChallengeProps {
    challengerUsername: string;
    onFinishQuiz: (score: number, selectedAnswers: number[], totalQuestions: number) => void;
    onCancel: () => void;
    numQuestions?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
}


const EASY_QUESTIONS: QuizQuestion[] = [
    {
        "id": 1,
        "question": "Kaj meri ampermeter?",
        "options": ["Napetost", "Tok", "Upornost"],
        "correctAnswer": 1
    },
    {
        "id": 2,
        "question": "Kaj mora vsebovati vsak električni krog?",
        "options": ["Napetost, vodnike, porabnika in odprto stikalo", "Napetost, porabnika in zaprto stikalo", "Napetost, vodnike in porabnika"],
        "correctAnswer": 0
    },
    {
        "id": 3,
        "question": "Kaj ščiti porabnike pred prevelikim el. tokom??",
        "options": ["", "", "Varovalka"],
        "correctAnswer": 2
    },
    {
        "id": 4,
        "question": "Kaj so najboljši prevodniki elektrike?",
        "options": ["Kovine", "Plastični materiali", "Gumijasti materiali"],
        "correctAnswer": 0
    },
    {
        "id": 5,
        "question": "Kaj je enota električnega toka?",
        "options": ["Volt", "Ampere", "Ohm"],
        "correctAnswer": 1
    },
    {
        "id": 6,
        "question": "Kdaj teče stalen tok?",
        "options": ["Tokovni krog ni zaključen", "Tokovni krog je zaključen", "Vedno"],
        "correctAnswer": 1
    },
    {
        "id": 7,
        "question": "Kaj je merska enota za električno upornost?",
        "options": ["Volt", "Ampere", "Ohm"],
        "correctAnswer": 2
    },
    {
        "id": 8,
        "question": "Kaj je merska enota za električno napetost?",
        "options": ["Volt", "Ampere", "Ohm"],
        "correctAnswer": 0
    },
    {
        "id": 9,
        "question": "Kaj pove Ohmov zakon?",
        "options": ["Tok je premo sorazmeren z napetostjo in obratno sorazmeren z upornostjo", "Tok je obratno sorazmeren z napetostjo in premo sorazmeren z upornostjo", "Tok je enak napetosti deljeno z upornostjo"],
        "correctAnswer": 0
    },
    {
        "id": 10,
        "question": "Kakšna je formula za izračun električnega toka?",
        "options": ["I = U * R", "I = U + R", "I = U / R"],
        "correctAnswer": 2
    },
    {
        "id": 11,
        "question": "Kaj predstavlja R v Ohmovem zakonu?",
        "options": ["Napetost", "Tok", "Upornost"],
        "correctAnswer": 2
    },
    {
        "id": 12,
        "question": "Kaj je gostota toka?",
        "options": ["Tok na enoto površine", "Tok na enoto prostornine", "Tok na enoto mase"],
        "correctAnswer": 0
    },
    {
        "id": 13,
        "question": "V katero smer se gibljejo negativno nabiti delci (npr. elektroni)?",
        "options": ["V isti smeri kot pozitivni", "V nasprotni smeri kot pozitivni", "Gibljejo se naključno"],
        "correctAnswer": 1
    },
    {
        "id": 14,
        "question": "Naboj merimo v?",
        "options": ["Coulombs", "Volts", "Ohms"],
        "correctAnswer": 0
    },
    {
        "id": 15,
        "question": "Kako imenujemo merilec toka?",
        "options": ["Voltmeter", "Ampermeter", "Ohmmeter"],
        "correctAnswer": 1
    },
    {
        "id": 16,
        "question": "Kako imenujemo merilec napetosti?",
        "options": ["Voltmeter", "Ampermeter", "Ohmmeter"],
        "correctAnswer": 0
    },
    {
        "id": 17,
        "question": "Kaj je značilno za zaporedno vezavo prevodnikov?",
        "options": ["Upornost celotnega kroga se poveča", "Upornost celotnega kroga se zmanjša", "Upornost celotnega kroga ostane enaka"],
        "correctAnswer": 2
    },
    {
        "id": 18,
        "question": "Kaj je značilno za vzporedno vezavo prevodnikov?",
        "options": ["Tok iz vira pri enaki napetosti se zmanjša", "Tok iz vira pri enaki napetosti se poveča", "Tok iz vira pri enaki napetosti ostane enak"],
        "correctAnswer": 1
    },
    {
        "id": 19,
        "question": "Kako priključimo ampermeter električni krog?",
        "options": ["V zaporedje z prevodnikom", "V vzporedje z prevodnikom", "Na vse prevodnike"],
        "correctAnswer": 0
    },
    {
        "id": 20,
        "question": "Kako priključimo voltmeter električni krog?",
        "options": ["V zaporedje z prevodnikom", "V vzporedje z prevodnikom", "Na vse prevodnike"],
        "correctAnswer": 1
    }

];

const MEDIUM_QUESTIONS: QuizQuestion[] = [
    {
        "id": 21,
        "question": "Električni skozi tok je ____________ z napetostjo?",
        "options": [
            "Premo sorazmeren",
            "Obratno sorazmeren",
        ],
        "correctAnswer": 0
    },
    {
        "id": 22,
        "question": "Električni skozi tok je ____________ z upornostjo prevodnika?",
        "options": [
            "Premo sorazmeren",
            "Obratno sorazmeren",
        ],
        "correctAnswer": 1
    },
    {
        "id": 23,
        "question": "Tokovi v posameznih vejah so v ____________ z njihovimi upornostmi?",
        "options": [
            "Obratnem sorazmerju",
            "Premem sorazmerju"
        ],
        "correctAnswer": 0
    },
    {
        "id": 24,
        "question": "Kaj je kratek stik v veji kroga?",
        "options": [
            "Upornost postane neskončna",
            "Upornost postane zanemarljivo majhna",
            "Upornost ostane enaka"
        ],
        "correctAnswer": 1
    },
    {
        "id": 25,
        "question": "Kaj je obupor oziroma shunt",
        "options": ["Zaporedno priključen prevodnik", "Vzporedno priključen prevodnik", "Prevodnik z neskončno upornostjo"],
        "image": "",
        "correctAnswer": 1
    },
    {
        "id": 26,
        "question": "Kaj je presežek toka?",
        "options": ["I - Ia", "I + Ia", "I - Ia / 2"],
        "correctAnswer": 0
    },
    {
        "id": 27,
        "question": "Kaj je predupor?",
        "options": ["Prevodnik z neskončno upornostjo", "Vzporedno priključen prevodnik", "Zaporedno priključen prevodnik"],
        "correctAnswer": 2
    },
    {
        "id": 28,
        "question": "Največji možni tok I skozi istrument je _________ kot tok skozi zaporedno priključen predupor?",
        "options": ["Enako velik", "Večji", "Manjši"],
        "correctAnswer": 0
    },
    {
        "id": 29,
        "question": "Zakaj uporabljamo zaporedno vezavo prevodnikov?",
        "options": ["Porazdelitev celotne napetosti vira med posamezne prevodnike", "Porazdelitev delne napetosti vira med posamezne prevodnike", "Porazdelitev minimalne napetosti vira med posamezne prevodnike"],
        "correctAnswer": 0
    },
    {
        "id": 30,
        "question": "V tokovnem krogu z zaporedno zvezanimi prevodniki imamo več različnih virov napetosti. Kaj je celotna napetost vira?",
        "options": ["Vsota vseh napetosti virov", "Napetost enega vira", "Napetost prevodnika"],
        "correctAnswer": 0
    }, {
        "id": 31,
        "question": "Električni skozi tok je ____________ z napetostjo?",
        "options": [
            "Premo sorazmeren",
            "Obratno sorazmeren",
        ],
        "correctAnswer": 0
    },
    {
        "id": 32,
        "question": "Električni skozi tok je ____________ z upornostjo prevodnika?",
        "options": [
            "Premo sorazmeren",
            "Obratno sorazmeren",
        ],
        "correctAnswer": 1
    },
    {
        "id": 33,
        "question": "Kaj se zgodi z napetostjo pri zaporedni vezavi uporov?",
        "options": [
            "Se porazdeli med upore",
            "Je enaka na vseh uporih",
            "Se podvoji"
        ],
        "correctAnswer": 0
    },
    {
        "id": 34,
        "question": "Kaj se zgodi s tokom pri vzporedni vezavi uporov?",
        "options": [
            "Je enak v vseh vejah",
            "Se porazdeli med veje",
            "Se podvoji"
        ],
        "correctAnswer": 1
    },
    {
        "id": 35,
        "question": "Kakšna je enota za električno delo?",
        "options": ["Joule", "Watt", "Volt"],
        "correctAnswer": 0
    },
    {
        "id": 36,
        "question": "Kakšna je enota za električno moč?",
        "options": ["Joule", "Watt", "Ampere"],
        "correctAnswer": 1
    },
    {
        "id": 37,
        "question": "Kako izračunamo električno moč?",
        "options": ["P = U × I", "P = U / I", "P = U + I"],
        "correctAnswer": 0
    },
    {
        "id": 38,
        "question": "Kaj predstavlja kilowattna ura (kWh)?",
        "options": ["Enoto moči", "Enoto energije", "Enoto napetosti"],
        "correctAnswer": 1
    },
    {
        "id": 39,
        "question": "Kaj je izmenični tok?",
        "options": [
            "Tok, ki se giblje samo v eno smer",
            "Tok, ki spreminja smer",
            "Tok, ki je vedno konstanten"
        ],
        "correctAnswer": 1
    },
    {
        "id": 40,
        "question": "Kakšna je standardna frekvenca izmenične napetosti v Sloveniji?",
        "options": ["50 Hz", "60 Hz", "100 Hz"],
        "correctAnswer": 0
    }
];

const HARD_QUESTIONS: QuizQuestion[] = [
    {
        "id": 41,
        "question": "Prevodnik vsebuje N = 4*10^19 gilbjivih nosilcev naboja v cm3 prostornine. S kolikšno povprečno hitrostjo se ti premikajo pri gostoti toka j = 1A / mm2?",
        "options": [
            "0.15 m / s",
            "0.25 m / s",
            "0.35 m / s"
        ],
        "explanation": "Uporabimo formulo za gostoto toka: j = n * q * v_d, kjer je n število nosilcev naboja na enoto prostornine, q naboj nosilca (za elektron je to približno 1.6 * 10^-19 C), in v_d je povprečna hitrost gibanja nosilcev naboja. Preuredimo formulo za v_d: v_d = j / (n * q). Vstavimo vrednosti: j = 1 A / mm2 = 1 * 10^6 A / m2, n = 4 * 10^19 cm3 = 4 * 10^25 m3, q = 1.6 * 10^-19 C. Izračunamo: v_d = (1 * 10^6) / (4 * 10^25 * 1.6 * 10^-19) = 0.15625 m/s, kar je približno 0.15 m/s.",
        "correctAnswer": 0
    },
    {
        "id": 42,
        "question": "Nek električni merski instrument (npr. ampermeter) ima notranjo upornost Rv = 1 kΩ in je grajen za napetost Uv = 100V. Kako lahko ta instrument priključimo na večjo napetost U = 500V?",
        "options": [
            "R = 4 kΩ",
            "R = 5 kΩ",
            "R = 6 kΩ"
        ],
        "image": "/public/imagesChallenge/quest42.png",
        "explanation": "Za priključitev instrumenta na večjo napetost uporabimo predopor (serijski upor). Skupna napetost U je razdeljena med notranjo upornost instrumenta Rv in predopor R. U = Uv + UR, kjer je UR napetost na predoporu. Napetost na predoporu izračunamo kot UR = U - Uv = 500V - 100V = 400V. Tok skozi krog je enak, zato uporabimo Ohmov zakon za predopor: UR = I * R. Tok I skozi instrument je I = Uv / Rv = 100V / 1000Ω = 0.1A. Sedaj izračunamo R: R = UR / I = 400V / 0.1A = 4000Ω = 4 kΩ.",
        "correctAnswer": 0
    },
    {
        "id": 43,
        "question": "Ampermeter z notranjo upornostjo Rv = 2 Ω meri tok I = 100 mA želimo uporabiit za merjenje tokov do I = 1 A. Kaj moramo napraviti?",
        "options": ["R = 0.18 kΩ", "R = 0.22 kΩ", "R = 0.31 kΩ"],
        "image": "",
        "explanation": "Za merjenje večjih tokov uporabimo shunt (vzporedni upor). Tok skozi ampermeter je I_v = 0.1 A, kar povzroči napetost U_v = I_v * R_v = 0.1 A * 2 Ω = 0.2 V. Za merjenje toka I = 1 A mora biti tok skozi shunt I_s = I - I_v = 1 A - 0.1 A = 0.9 A. Napetost na shuntu mora biti enaka napetosti na ampermeteru, torej U_s = U_v = 0.2 V. Sedaj izračunamo upornost shunta: R_s = U_s / I_s = 0.2 V / 0.9 A ≈ 0.222 Ω, kar je približno 0.22 kΩ.",
        "correctAnswer": 1
    },
    {
        "id": 44,
        "question": "Prevodniki R1 = 10, R2 = 152, R3 = 202, R4 = 15, in R5 = 59 so povezani, kot kaže slika , ter priključeni na napetost U = 50 V. Kolikšne so napetosti (U1, ..., Us) na posameznih prevodni- kih ter kolikšni tokovi (1, ..., 5) tečejo skoznje? Kolikšna je nadomestna upornost (R) ter kolik tok (1) teče skozi vir napetosti?",
        "options": ["3.7Ω", "4.1Ω", "5.4Ω"],
        "image": "/public/imagesChallenge/quest44.png",
        "explanation": "Prevodnika R2 in R1 sta povezana zaporedno (14 = 1⁄2), zato ju lahko nadomestimo s prevodnikom z upornostjo R' = R2+ R4 = 30. Ta je vzpo- redno priključen prevodniku R3 in prevodniku R1. Vse tri torej lahko nadomestimo s prevodnikom R, za katerega velja:R = R1R'R3/(R1R' + R1R3 + R'R3)",
        "correctAnswer": 2
    },
    {
        "id": 45,
        "question": "Kaj pove Kirchhoffov tokovni zakon za vozlišče v električnem krogu?",
        "options": [
            "Vsota napetosti v zanki je enaka nič",
            "Vsota tokov, ki pritekajo v vozlišče, je enaka vsoti tokov, ki odtekajo",
            "Upornost je enaka razmerju napetosti in toka"
        ],
        "correctAnswer": 1
    },
    {
        "id": 46,
        "question": "Pri zaporedni vezavi dveh uporov z upornostima R1 = 30 Ω in R2 = 60 Ω, kolikšna je celotna upornost?",
        "options": [
            "20 Ω",
            "45 Ω",
            "90 Ω"
        ],
        "explanation": "Nadomestna upornost R pri zaporedni vezavi dveh uporov je enaka vsoti posameznih upornosti: R = R1 + R2. Vstavimo vrednosti: R1 = 30 Ω in R2 = 60 Ω. Izračunamo: R = 30 Ω + 60 Ω = 90 Ω.",
        "correctAnswer": 2
    },
    {
        "id": 47,
        "question": "Pri vzporedni vezavi dveh uporov z upornostima R1 = 12 Ω in R2 = 6 Ω, kolikšna je nadomestna upornost?",
        "options": [
            "4 Ω",
            "8 Ω",
            "18 Ω"
        ],
        "explanation": "Nadomestna upornost R pri vzporedni vezavi dveh uporov je dana z izrazom 1/R = 1/R1 + 1/R2. Vstavimo vrednosti: R1 = 12 Ω in R2 = 6 Ω. Izračunamo: 1/R = 1/12 + 1/6 = 1/12 + 2/12 = 3/12, kar pomeni R = 12/3 = 4 Ω.",
        "correctAnswer": 0
    },
    {
        "id": 48,
        "question": "Kakšna je moč, ki se sprošča v uporu R = 50 Ω, če skozi njega teče tok I = 2 A?",
        "options": [
            "100 W",
            "200 W",
            "400 W"
        ],
        "explanation": "Moč, ki se sprošča v uporu, je dana z izrazom P = I^2 * R. Vstavimo vrednosti: I = 2 A in R = 50 Ω. Izračunamo: P = (2 A)^2 * 50 Ω = 4 * 50 = 200 W.",
        "correctAnswer": 1
    },
    {
        "id": 49,
        "question": "Kondenzator kapacitete C = 10 μF je napolnjen na napetost U = 100 V. Kolikšna je energija, shranjena v kondenzatorju?",
        "options": [
            "0.05 J",
            "0.5 J",
            "5 J"
        ],
        "explanation": "Energija shranjena v kondenzatorju je dana z izrazom W = 0.5 * C * U^2. Vstavimo vrednosti: C = 10 * 10^-6 F in U = 100 V. Izračunamo: W = 0.5 * 10 * 10^-6 F * (100 V)^2 = 0.5 * 10 * 10^-6 F * 10000 V^2 = 0.5 J.",
        "correctAnswer": 0
    },
    {
        "id": 50,
        "question": "Tuljava z induktivnostjo L = 0.5 H nosi tok I = 4 A. Kolikšna je energija magnetnega polja v tuljavi?",
        "options": [
            "1 J",
            "4 J",
            "8 J"
        ],
        "explanation": "Energija magnetnega polja v tuljavi je dana z izrazom W = 0.5 * L * I^2. Vstavimo vrednosti: L = 0.5 H in I = 4 A. Izračunamo: W = 0.5 * 0.5 H * (4 A)^2 = 0.25 * 16 = 4 J.",
        "correctAnswer": 1
    },
    {
        "id": 51,
        "question": "V RC vezju je upor R = 1 kΩ in kondenzator C = 100 μF. Kolikšna je časovna konstanta τ tega vezja?",
        "options": [
            "0.01 s",
            "0.1 s",
            "1 s"
        ],
        "correctAnswer": 1
    },
    {
        "id": 52,
        "question": "Kakšno je razmerje med efektivno in amplitudno vrednostjo sinusne napetosti?",
        "options": [
            "U_ef = U_0 / √2",
            "U_ef = U_0 / 2",
            "U_ef = U_0 × √2"
        ],
        "correctAnswer": 0
    },
    {
        "id": 53,
        "question": "V RLC zaporednem krogu je resonančna frekvenca podana z izrazom:",
        "options": [
            "f = 1 / (2π√(LC))",
            "f = 2π√(LC)",
            "f = √(LC) / 2π"
        ],
        "explanation": "Resonančna frekvenca f v RLC zaporednem krogu je dana z izrazom f = 1 / (2π√(LC)), kjer sta L induktivnost in C kapaciteta v krogu.",
        "correctAnswer": 0
    },
    {
        "id": 54,
        "question": "Kapacitivna reaktanca kondenzatorja kapacitete C = 1 μF pri frekvenci f = 1 kHz je približno:",
        "options": [
            "159 Ω",
            "628 Ω",
            "1000 Ω"
        ],
        "explanation": "Kapacitivna reaktanca X_C je dana z izrazom X_C = 1 / (2πfC). Vstavimo vrednosti: f = 1000 Hz in C = 1 * 10^-6 F. Izračunamo: X_C = 1 / (2π × 1000 Hz × 1 * 10^-6 F) ≈ 159 Ω.",
        "correctAnswer": 0
    },
    {
        "id": 55,
        "question": "Induktivna reaktanca tuljave z induktivnostjo L = 100 mH pri frekvenci f = 50 Hz je:",
        "options": [
            "15.7 Ω",
            "31.4 Ω",
            "62.8 Ω"
        ],
        "explanation": "Induktivna reaktanca X_L je dana z izrazom X_L = 2πfL. Vstavimo vrednosti: f = 50 Hz in L = 0.1 H. Izračunamo: X_L = 2π × 50 Hz × 0.1 H = 31.4 Ω.",
        "correctAnswer": 1
    },
    {
        "id": 56,
        "question": "Pri meritvi napetosti z voltmetrom mora biti voltmetrova notranja upornost:",
        "options": [
            "Zelo majhna",
            "Enaka upornosti vezja",
            "Zelo velika"
        ],
        "correctAnswer": 2
    },
    {
        "id": 57,
        "question": "Pri meritvi toka z ampermetrom mora biti ampermetrova notranja upornost:",
        "options": [
            "Zelo majhna",
            "Enaka upornosti vezja",
            "Zelo velika"
        ],
        "correctAnswer": 0
    },
    {
        "id": 58,
        "question": "Théveninov izrek omogoča, da katerokoli linearno električno vezje nadomestimo z:",
        "options": [
            "Idealnim virom napetosti",
            "Virom napetosti in zaporedno upornostjo",
            "Virom toka in vzporedno upornostjo"
        ],
        "correctAnswer": 1
    },
    {
        "id": 59,
        "question": "V vezju z idealnnim virom toka je napetost na virovnih sponkah odvisna od:",
        "options": [
            "Obremenitve vezja",
            "Notranje upornosti vira",
            "Le od toka, ki ga vir zagotavlja"
        ],
        "correctAnswer": 0
    },
    {
        "id": 60,
        "question": "Mostično vezje (Wheatstonov mostič) je v ravnovesju, ko velja:",
        "options": [
            "R1 × R4 = R2 × R3",
            "R1 + R2 = R3 + R4",
            "R1 / R2 = R3 / R4"
        ],
        "correctAnswer": 0
    }
];


function getQuestionByDifficulty(difficulty: 'easy' | 'medium' | 'hard', numQuestions: number): QuizQuestion[] {
    let QuestionPool = [];
    switch (difficulty) {
        case 'easy':
            QuestionPool = EASY_QUESTIONS;
            break;
        case 'medium':
            QuestionPool = MEDIUM_QUESTIONS;
            break;
        case 'hard':
            QuestionPool = HARD_QUESTIONS;
            break;
        default:
            QuestionPool = MEDIUM_QUESTIONS;

    }
    const shuffled = [...QuestionPool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(numQuestions, shuffled.length));
};

export default function QuizChallenge({
    challengerUsername,
    onFinishQuiz,
    onCancel,
    numQuestions = 3,
    difficulty = 'medium'

}: QuizChallengeProps) {
    const questions = useMemo(() => getQuestionByDifficulty(difficulty, numQuestions), [difficulty, numQuestions]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>(
        Array(questions.length).fill(-1)
    );
    const [quizFinished, setQuizFinished] = useState(false);
    const [score, setScore] = useState(0);

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    const [showImage, setShowImage] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);

    const handleAnswerSelect = (optionIndex: number) => {
        const newSelectedAnswers = [...selectedAnswers];
        newSelectedAnswers[currentQuestionIndex] = optionIndex;
        setSelectedAnswers(newSelectedAnswers);
    };


    const calculateScore = () => {
        let correct = 0;
        selectedAnswers.forEach((answer, index) => {
            if (answer === questions[index].correctAnswer) {
                correct++;
            }
        });
        return correct;
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            const finalScore = calculateScore();
            setScore(finalScore);
            setQuizFinished(true);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmitQuiz = () => {
        const finalScore = calculateScore();
        onFinishQuiz(finalScore, selectedAnswers, questions.length);
    };

const calculateStarImpact = () => {
    const halfQuestions = Math.ceil(questions.length / 2);
    const answerDifference = Math.abs(score - (questions.length - score));
    
    let baseStars = 0;
    if (score >= halfQuestions) {
        if (answerDifference <= 1) {
            baseStars = 5;
        } else if (answerDifference < 3) {
            baseStars = 10;
        } else {
            baseStars = 15;
        }
    } else {
        if (answerDifference <= 1) {
            baseStars = 10;
        } else {
            baseStars = 15;
        }
    }

    const difficultyMultiplier: Record<'easy' | 'medium' | 'hard', number> = {
        'easy': 1,
        'medium': 1.5,
        'hard': 2
    };
    
    const multiplier = difficultyMultiplier[difficulty];
    return Math.round(baseStars * multiplier);
};
    

    if (quizFinished) {
        const halfQuestions = Math.ceil(questions.length / 2);
        const isWinner = score >= halfQuestions;
        const starImpact = calculateStarImpact();

        return (
            <div className="p-8 bg-white max-w-md mx-auto mt-10">
                <h4 className="text-2xl font-bold mb-4 text-center">Kviz zaključen!</h4>
                <div className={`mb-6 text-center ${isWinner ? 'text-teal-600' : 'text-red-500'}`}>
                    <p className="text-lg font-semibold mb-2">
                        Dosegli ste <span className="font-bold">{score}</span> od <span className="font-bold">{questions.length}</span> točk.
                    </p>
                    <div className="mt-4 p-4 rounded-lg bg-gray-50 border-2 border-dashed"
                        style={{ borderColor: isWinner ? '#0d9488' : '#ef4444' }}>
                        {isWinner ? (
                            <>
                                <p className="text-lg font-bold text-teal-600 mb-1">🎉 Čestitamo, zmagali ste!</p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold">{challengerUsername}</span> izgubi{' '}
                                    <span className="font-bold text-teal-600">{starImpact} ⭐</span>
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-lg font-bold text-red-500 mb-1">😔 Žal niste uspeli</p>
                                <p className="text-sm text-gray-600">
                                    Izgubili boste{' '}
                                    <span className="font-bold text-red-500">{starImpact} ⭐</span>
                                </p>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex justify-center gap-4">
                    <Button color="gray" onClick={onCancel}>
                        ← Nazaj
                    </Button>
                    <Button color="teal" onClick={handleSubmitQuiz} className="px-6">
                        ➤ Pošlji rezultat
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Vprašanje {currentQuestionIndex + 1}/{questions.length}</h3>
                    <span className="text-sm text-teal-600 font-semibold">
                        Izziv od: {challengerUsername}
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className="bg-teal-600 h-2.5 rounded-full"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <h4 className="text-lg font-semibold">
                        {currentQuestion.question}
                    </h4>
                    <div>
                        {currentQuestion.image && (
                            <button
                                onClick={() => setShowImage(true)}
                                className="shrink-0 px-3 py-1.5 text-sm font-semibold rounded-md border border-teal-500 text-teal-600 hover:bg-teal-50 transition">
                                🖼 Poglej sliko
                            </button>
                        )}
                        {currentQuestion.explanation && selectedAnswers[currentQuestionIndex] !== -1 && (
                            <button
                                onClick={() => setShowExplanation(true)}
                                className="shrink-0 px-3 py-1.5 text-sm font-semibold rounded-md border border-teal-500 text-teal-600 hover:bg-teal-50 transition">
                                ℹ Razlaga
                            </button>
                        )}</div>
                </div>
                <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            disabled={selectedAnswers[currentQuestionIndex] !== -1}
                            onClick={() => handleAnswerSelect(index)}
                            className={`w-full p-3 text-left rounded-lg border transition ${selectedAnswers[currentQuestionIndex] !== -1 && index === currentQuestion.correctAnswer
                                ? 'bg-green-100 border-green-500 text-green-700 font-semibold'
                                : selectedAnswers[currentQuestionIndex] === index &&
                                    index !== currentQuestion.correctAnswer
                                    ? 'bg-red-100 border-red-500 text-red-700'
                                    : selectedAnswers[currentQuestionIndex] === index
                                        ? 'bg-teal-50 border-teal-500 text-teal-700 font-semibold'
                                        : 'bg-white border-gray-300 hover:border-teal-400'
                                }
                            `}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-between">
                <div>
                    <Button
                        color="gray"
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="px-4"
                    >
                        ← Nazaj
                    </Button>
                </div>
                <div className="flex gap-3">
                    <Button color="gray" onClick={onCancel}>
                        Prekliči
                    </Button>
                    <Button
                        color="success"
                        onClick={handleNextQuestion}
                        disabled={selectedAnswers[currentQuestionIndex] === -1}
                        className="px-6"
                    >
                        {currentQuestionIndex === questions.length - 1 ? '✓ Zaključi' : 'Naprej →'}
                    </Button>
                </div>
            </div>
            {showImage && currentQuestion.image && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="relative bg-white rounded-lg p-4 max-w-3xl w-full mx-4">
                        <button
                            onClick={() => setShowImage(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>

                        <img
                            src={currentQuestion.image}
                            alt="Slika vprašanja"
                            className="w-full h-auto rounded-md"
                        />
                    </div>
                </div>
            )}
            {showExplanation && currentQuestion.explanation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="relative bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                        <button
                            onClick={() => setShowExplanation(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                        <p className="text-lg font-semibold text-gray-800">{currentQuestion.explanation}</p>
                    </div>
                </div>
            )}
        </div>

    );
}
