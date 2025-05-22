// (() => {
// 	type ColorsUnion = "red" | "green" | "blue" | "yellow";
// 	type ColorData = {
// 		main: string;
// 		dark: string;
// 		light: string;
// 		extra: string;
// 	};
// 	type InputModel = Record<ColorsUnion, ColorData>;

// 	type Tone<MainReturn = any, SubtoneReturn = any> = {
// 		name: string;
// 		main: (data: ColorData) => MainReturn;
// 		subtone: Record<string, (data: ColorData) => SubtoneReturn>;
// 	};

// 	function createTone<
// 		MainFn extends (data: ColorData) => any,
// 		Subtone extends Record<string, (data: ColorData) => any>
// 	>(mainFn: MainFn, options?: { name?: string; subtone?: Subtone }): Tone<ReturnType<MainFn>, any> {
// 		return {
// 			name: options?.name || "default",
// 			main: mainFn,
// 			subtone: options?.subtone || ({} as Subtone),
// 		};
// 	}

// 	type BaseEntries<B extends Tone | undefined> = B extends Tone
// 		? { [C in ColorsUnion]: ColorData & ReturnType<B["main"]> }
// 		: { [C in ColorsUnion]: ColorData };

// 	type ToneMainEntries<Tones extends Record<string, Tone>> = {
// 		[C in ColorsUnion]: {
// 			[T in keyof Tones as Tones[T] extends { name: infer N } ? `${C}_${N}` : never]: Tones[T] extends Tone
// 				? ReturnType<Tones[T]["main"]>
// 				: never;
// 		};
// 	}[ColorsUnion];

// 	type SubtoneEntries<Tones extends Record<string, Tone>> = {
// 		[C in ColorsUnion]: {
// 			[T in keyof Tones]: Tones[T] extends { name: infer N; subtone: infer S }
// 				? S extends Record<string, (data: ColorData) => any>
// 					? {
// 							[SK in keyof S as `${C}_${SK & string}_${N}`]: ReturnType<S[SK]>;
// 					  }
// 					: never
// 				: never;
// 		}[keyof Tones];
// 	}[ColorsUnion];

// 	type CombinedPalette<
// 		B extends Tone | undefined,
// 		Tones extends Record<string, Tone> | undefined
// 	> = BaseEntries<B> &
// 		(Tones extends Record<string, Tone> ? ToneMainEntries<Tones> : {}) &
// 		(Tones extends Record<string, Tone> ? SubtoneEntries<Tones> : {});

// 	function createPalette<B extends Tone, Tones extends Record<string, Tone>>(
// 		input: InputModel,
// 		config?: {
// 			base?: B;
// 			tones?: Tones;
// 		}
// 	): CombinedPalette<B, Tones> {
// 		const result: any = {};

// 		// Process base tone
// 		const baseTone = config?.base;
// 		(Object.keys(input) as ColorsUnion[]).forEach(color => {
// 			const colorData = input[color];
// 			if (baseTone) {
// 				const baseResult = baseTone.main(colorData);
// 				result[color] = { ...colorData, ...baseResult };
// 			} else {
// 				result[color] = { ...colorData };
// 			}
// 		});

// 		// Process other tones
// 		const tones = config?.tones || {};
// 		Object.values(tones).forEach(tone => {
// 			const toneName = tone.name;
// 			(Object.keys(input) as ColorsUnion[]).forEach(color => {
// 				const colorData = input[color];

// 				// Main tone entry
// 				const mainResult = tone.main(colorData);
// 				result[`${color}_${toneName}`] = mainResult;

// 				// Process subtone entries
// 				Object.entries(tone.subtone).forEach(([subtoneKey, subtoneFn]) => {
// 					const subtoneResult = subtoneFn(colorData);
// 					result[`${color}_${subtoneKey}_${toneName}`] = subtoneResult;
// 				});
// 			});
// 		});

// 		return result as CombinedPalette<B, Tones>;
// 	}

// 	// Example usage:
// 	const baseColors = createTone((data: ColorData) => ({
// 		background: data.main,
// 		color: data.main,
// 	}));

// 	const brightness = createTone(
// 		data => ({
// 			foreground: data.main,
// 			customProp: "#f0f0f0",
// 		}),
// 		{
// 			name: "brightness",
// 			subtone: {
// 				low: data => ({ white: data.light }),
// 				medium: data => ({ shadow: data.main }),
// 				high: data => ({
// 					someProp: "transparent",
// 					anotherProp: "#fff",
// 					thirdCustomProp: data.main,
// 				}),
// 				ultra: data => ({ intensive: data.extra }),
// 			},
// 		}
// 	);

// 	const depths = createTone(
// 		data => ({
// 			background: data.light,
// 			foreground: data.main,
// 			color: data.extra,
// 		}),
// 		{
// 			name: "depth",
// 			subtone: {
// 				"8-bit": data => ({ borderColor: data.main }),
// 				"16-bit": data => ({ borderColor: data.main, anotherColor: data.light }),
// 				"24-bit": data => ({ extraColor: data.extra }),
// 			},
// 		}
// 	);

// 	const input = {
// 		red: {
// 			main: "red",
// 			dark: "darkred",
// 			light: "lightred",
// 			extra: "extrared",
// 		},
// 		green: {
// 			main: "green",
// 			dark: "darkgreen",
// 			light: "lightgreen",
// 			extra: "extragreen",
// 		},
// 		blue: {
// 			main: "blue",
// 			dark: "darkblue",
// 			light: "lightblue",
// 			extra: "extrablue",
// 		},
// 		yellow: {
// 			main: "yellow",
// 			dark: "darkyellow",
// 			light: "lightyellow",
// 			extra: "extrayellow",
// 		},
// 	} satisfies InputModel;

// 	const colors = createPalette(input, {
// 		base: baseColors,
// 		tones: {
// 			brightness,
// 			depths,
// 		},
// 	});
// 	console.log(colors);
// })();
