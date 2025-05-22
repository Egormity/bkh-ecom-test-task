type TColorsUnion = "red" | "green" | "blue" | "yellow" | "myColor";
type TColorsData = {
	main: string;
	dark: string;
	light: string;
	extra: string;
};
type TInputModel = Record<TColorsUnion, TColorsData>;

//
type TSubTones<TReturn> = Record<string, (data: TColorsData) => TReturn> | null;
type TTone<TFuncReturn = unknown, TSubTonesReturn = unknown> = {
	name: string | null;
	func: (data: TColorsData) => TFuncReturn;
	subTones: TSubTones<TSubTonesReturn>;
};

//
const createTone = <
	TFunc extends (data: TColorsData) => any,
	TSubTonesLocal extends TSubTones<Record<string, string>>
>(
	func: TFunc,
	options?: { name: string; subTones: TSubTonesLocal }
): TTone<ReturnType<TFunc>, Record<string, string>> => ({
	name: options?.name || null,
	func,
	subTones: options?.subTones || null,
});

//
type TGenerateToneKeys<TInput extends TInputModel, TTones extends Record<string, TTone>> = {
	[COLOR in keyof TInput & string]: {
		[TONE in keyof TTones & string]: `${COLOR}_${TONE}`;
	}[keyof TTones & string];
}[keyof TInput & string];

//
type TGenerateSubToneKeys<TInput extends TInputModel, TTones extends Record<string, TTone>> = {
	[COLOR in keyof TInput & string]: {
		[TONE in keyof TTones & string]: {
			// !!!!!!!!!! FIXME: DOESN'T PROVIDE ["color_tone_subTone"] TYPES SAFETY AS EXPECTED !!!!!!!!!!!!
			[SUB_TONE in keyof TTone["subTones"] & string]: `${COLOR}_${TONE}_${SUB_TONE}`;
		}[keyof TTone["subTones"] & string];
	}[keyof TTones & string];
}[keyof TInput & string];

//
type TAllKeys<Input extends TInputModel, TTones extends Record<string, TTone>> =
	| keyof Input
	| TGenerateToneKeys<Input, TTones>
	| TGenerateSubToneKeys<Input, TTones>;

//
type TPalette<
	Input extends TInputModel,
	BaseTone extends TTone<object>,
	TTones extends Record<string, TTone>
> = {
	[KEY in TAllKeys<Input, TTones>]: KEY extends keyof Input // 1. Base color
		? Input[KEY] & ReturnType<BaseTone["func"]>
		: // 2. Color_Tone
		KEY extends TGenerateToneKeys<Input, TTones>
		? KEY extends `${infer _COLOR}_${infer TONE}`
			? TONE extends keyof TTones
				? ReturnType<TTones[TONE]["func"]>
				: never
			: never
		: KEY extends TGenerateSubToneKeys<Input, TTones>
		? // 3. Color_Tone_SubTone
		  KEY extends `${infer _COLOR}_${infer TONE}_${infer SUB_TONE}`
			? TONE extends keyof TTones
				? TTones[TONE]["subTones"] extends Record<TONE | SUB_TONE, (data: TColorsData) => infer RETURN>
					? RETURN
					: never
				: never
			: never
		: never;
};

//
const createPalette = <
	Input extends TInputModel,
	BaseTone extends TTone<object>,
	Tones extends Record<string, TTone<object>>
>(
	input: Input,
	options?: { base: BaseTone; tones: Tones }
): TPalette<Input, BaseTone, Tones> => {
	console.log(options?.tones["brightness"]);
	const result: TPalette<Input, BaseTone, Tones> = {} as TPalette<Input, BaseTone, Tones>;

	Object.entries(input).forEach(([colorName, colorData]) => {
		(result as any)[colorName] = { ...colorData, ...(options?.base.func(colorData) || {}) };

		Object.entries(options?.tones || {}).forEach(([toneName, toneData]) => {
			const mainResult = toneData.func(colorData);
			(result as any)[`${colorName}_${toneName}`] = mainResult;

			Object.entries(toneData.subTones || {}).forEach(([subToneName, subToneFunc]) => {
				const subToneResult = subToneFunc(colorData);
				(result as any)[`${colorName}_${toneName}_${subToneName}`] = subToneResult;
			});
		});
	});

	return result;
};

//
const baseColors = createTone(data => ({
	background: data.main,
	color: data.main,
}));
const brightness = createTone(
	data => ({
		foreground: data.main,
		customProp: "#f0f0f0",
	}),
	{
		name: "brightness",
		subTones: {
			low: data => ({ white: data.light }),
			medium: data => ({ shadow: data.main }),
			high: data => ({
				someProp: "transparent",
				anotherProp: "#fff",
				thirdCustomProp: data.main,
			}),
			ultra: data => ({ intensive: data.extra }),
		},
	}
);
const depths = createTone(
	data => ({
		background: data.light,
		foreground: data.main,
		color: data.extra,
	}),
	{
		name: "depth",
		subTones: {
			"8-bit": data => ({ borderColor: data.main }),
			"16-bit": data => ({ borderColor: data.main, anotherColor: data.light }),
			"24-bit": data => ({ extraColor: data.extra }),
			"ultra": data => ({ intensive: data.extra }),
		},
	}
);

//
const input = {
	red: {
		main: "red",
		dark: "redDark",
		light: "redLight",
		extra: "redExtra",
	},
	green: {
		main: "green",
		dark: "greenDark",
		light: "greenLight",
		extra: "greenExtra",
	},
	blue: {
		main: "blue",
		dark: "blueDark",
		light: "blueLight",
		extra: "blueExtra",
	},
	yellow: {
		main: "yellow",
		dark: "yellowDark",
		light: "yellowLight",
		extra: "yellowExtra",
	},
	myColor: {
		main: "myColor",
		dark: "myColorDark",
		light: "myColorLight",
		extra: "myColorExtra",
	},
} satisfies TInputModel;

const palette = createPalette(input, {
	base: baseColors,
	tones: {
		brightness: brightness,
		depths: depths,
	},
});
console.log(palette);
console.log(palette.blue_brightness.foreground);
console.log(palette.myColor);
// !!!!!!!!!! FIXME: DOESN'T PROVIDE ["color_tone_subTone"] TYPES SAFETY AS EXPECTED !!!!!!!!!!!!
// @ts-ignore
console.log(palette.blue_brightness_low.white);
