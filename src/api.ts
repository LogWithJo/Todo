export async function getIcon(task: string) {

	const res = await fetch(
		`https://api.iconify.design/search?query=${encodeURIComponent(task)}`,
	);

	const data = await res.json();

	return data.icons?.[0] || undefined;
}

export async function showIcon(task: string) {
	const icon = await getIcon(task);

    if (icon === undefined) {
        return undefined
    }
    
	const el = document.createElement("span");

	el.className = "iconify text-white text-xl";
	el.setAttribute("data-icon", icon);

	return el;
}