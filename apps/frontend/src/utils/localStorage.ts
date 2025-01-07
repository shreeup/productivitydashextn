export function saveTasksToLocalStorage(tasks: any) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

export function getTasksFromLocalStorage(): any[] {
  const tasks = localStorage.getItem('tasks');
  return tasks ? JSON.parse(tasks) : [];
}
