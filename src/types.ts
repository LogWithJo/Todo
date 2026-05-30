export type array = [string, State, string][];
export type alone = [string, State, string];

export enum Show {
	empty = "empty",
	repeated = "repeated",
}

export enum Choose {
	unachieve = "unachieve",
	check = "check",
	remove = "remove",
	edit = "edit",
}

export enum RemoveType {
	undo = "undo",
	return = "return",
}

export enum State {
	uncompleted = "uncompleted",
	completed = "completed",
}

export enum Group {
	all = "all",
	completed = "completed",
	tasks = "tasks",
}
