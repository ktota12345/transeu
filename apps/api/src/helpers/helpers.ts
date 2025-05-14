// helpers.ts
export const buildSort = (sortField: string | undefined, sortOrder: string | undefined) => {
    if (sortField && sortOrder) {
        return {
            [sortField]: sortOrder.toLowerCase() as 'asc' | 'desc',
        };
    }
    return undefined;
};

// helpers.ts
export function buildFilters(query: Record<string, any>) {
    const filterObj: Record<string, any> = {};

    // Sprawdzamy i rozdzielamy filtry typu filter[name]=value
    for (const key in query) {
        if (key.startsWith('filter[') && key.endsWith(']')) {
            const fieldName = key.slice(7, -1); // Usuwamy 'filter[' i ']' z klucza
            filterObj[fieldName] = query[key];  // Dodajemy filtr do obiektu
        }
    }

    // Sprawdzamy, czy w query pojawił się JSON w parametrze filter
    if (query.filter) {
        try {
            const jsonFilters = JSON.parse(query.filter);
            Object.assign(filterObj, jsonFilters);  // Łączymy filtry z URL i JSON
        } catch (e) {
            console.error('Błąd parsowania JSON filtra:', e);
        }
    }

    // Można rozwinąć logikę tutaj np. dodając różne operatory, jak equals, contains, etc.
    const prismaFilters: Record<string, any> = {};
    for (const key in filterObj) {
        if (filterObj[key] && Array.isArray(filterObj[key])) {
            prismaFilters[key] = { in: filterObj[key] };
        } else {
            if(key==='id' || key.indexOf('Id') !== -1) {
                prismaFilters[key] = { equals: parseInt(filterObj[key]) };
            }else {
                prismaFilters[key] = {
                    contains: filterObj[key],
                    mode: 'insensitive',
                };
            }
        }
    }

    return prismaFilters;
}

// helpers.ts
export function getPagination(query: Record<string, any>) {
    const page = parseInt(query['pagination[page]'] ?? '1', 10);
    const perPage = parseInt(query['pagination[perPage]'] ?? '10', 10);
    const skip = (page - 1) * perPage;
    const take = perPage;

    return { skip, take };
}

