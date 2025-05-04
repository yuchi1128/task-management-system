import { Task } from '@/lib/api';
import { GridSortModel } from '@mui/x-data-grid';

export function multiSort(tasks: Task[], sortModel: GridSortModel) {
  return [...tasks].sort((a, b) => {
    for (const sort of sortModel) {
      let aValue = a[sort.field as keyof Task];
      let bValue = b[sort.field as keyof Task];

      if (sort.field === 'start_date' || sort.field === 'end_date') {
        aValue = aValue ? new Date(aValue as string).getTime() : 0;
        bValue = bValue ? new Date(bValue as string).getTime() : 0;
      }

      if (sort.field === 'priority') {
        const priorityOrder: Record<string, number> = {
          High: 3,
          Middle: 2,
          Low: 1,
        };
        aValue = priorityOrder[aValue as string] || 0;
        bValue = priorityOrder[bValue as string] || 0;
      }
      
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return sort.sort === 'asc' ? -1 : 1;
      if (bValue === undefined) return sort.sort === 'asc' ? 1 : -1;
      if (aValue < bValue) return sort.sort === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.sort === 'asc' ? 1 : -1;
    }
    return 0;
  });
}

export function filterTasks(
  tasks: Task[],
  searchParams: {
    name: string;
    description: string;
    priority: string;
    status: string;
    endDateFrom: Date | null;
    endDateTo: Date | null;
    labelIds?: number[];
  }
) {
  return tasks.filter((task) => {
    const basicFiltersPassed =
      (searchParams.name === '' ||
        task.name.toLowerCase().includes(searchParams.name.toLowerCase())) &&
      (searchParams.description === '' ||
        (task.description &&
          task.description
            .toLowerCase()
            .includes(searchParams.description.toLowerCase()))) &&
      (searchParams.priority === '' || task.priority === searchParams.priority) &&
      (searchParams.status === '' || task.status === searchParams.status);

    let dateFilterPassed = true;
    if (searchParams.endDateFrom || searchParams.endDateTo) {
      const taskEndDate = task.end_date ? new Date(task.end_date).getTime() : null;

      if (taskEndDate) {
        if (searchParams.endDateFrom && searchParams.endDateTo) {
          const fromTime = searchParams.endDateFrom.getTime();
          const toTime = searchParams.endDateTo.getTime();
          dateFilterPassed = taskEndDate >= fromTime && taskEndDate <= toTime;
        } else if (searchParams.endDateFrom) {
          dateFilterPassed = taskEndDate >= searchParams.endDateFrom.getTime();
        } else if (searchParams.endDateTo) {
          dateFilterPassed = taskEndDate <= searchParams.endDateTo.getTime();
        }
      } else {
        dateFilterPassed = false;
      }
    }

    let labelFilterPassed = true;
    if (searchParams.labelIds && searchParams.labelIds.length > 0) {
      const taskLabelIds = (task.labels || []).map(l => l.id);
      labelFilterPassed = searchParams.labelIds.every(id => taskLabelIds.includes(id));
    }

    return basicFiltersPassed && dateFilterPassed && labelFilterPassed;
  });
}