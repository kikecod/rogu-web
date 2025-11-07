/**
 * Datos geográficos de Bolivia para formularios de sede
 * Incluye departamentos, ciudades principales y distritos/zonas
 */

export interface District {
  id: string;
  name: string;
}

export interface City {
  id: string;
  name: string;
  districts: District[];
}

export interface Department {
  id: string;
  name: string;
  cities: City[];
}

export interface Country {
  id: string;
  name: string;
  code: string;
  timezone: string;
  departments: Department[];
}

export const BOLIVIA_DATA: Country = {
  id: 'BO',
  name: 'Bolivia',
  code: 'BO',
  timezone: 'America/La_Paz',
  departments: [
    {
      id: 'LP',
      name: 'La Paz',
      cities: [
        {
          id: 'LP_LA_PAZ',
          name: 'La Paz',
          districts: [
            { id: 'LP_LP_CENTRO', name: 'Centro' },
            { id: 'LP_LP_SAN_MIGUEL', name: 'San Miguel' },
            { id: 'LP_LP_SOPOCACHI', name: 'Sopocachi' },
            { id: 'LP_LP_MIRAFLORES', name: 'Miraflores' },
            { id: 'LP_LP_SAN_PEDRO', name: 'San Pedro' },
            { id: 'LP_LP_ROSARIO', name: 'Rosario' },
            { id: 'LP_LP_ZONA_SUR', name: 'Zona Sur' },
            { id: 'LP_LP_ACHUMANI', name: 'Achumani' },
            { id: 'LP_LP_CALACOTO', name: 'Calacoto' },
            { id: 'LP_LP_LA_FLORIDA', name: 'La Florida' }
          ]
        },
        {
          id: 'LP_EL_ALTO',
          name: 'El Alto',
          districts: [
            { id: 'LP_EA_DISTRITO_1', name: 'Distrito 1' },
            { id: 'LP_EA_DISTRITO_2', name: 'Distrito 2' },
            { id: 'LP_EA_DISTRITO_3', name: 'Distrito 3' },
            { id: 'LP_EA_DISTRITO_4', name: 'Distrito 4' },
            { id: 'LP_EA_DISTRITO_5', name: 'Distrito 5' },
            { id: 'LP_EA_DISTRITO_6', name: 'Distrito 6' }
          ]
        },
        {
          id: 'LP_ACHACACHI',
          name: 'Achacachi',
          districts: [
            { id: 'LP_AC_CENTRO', name: 'Centro' },
            { id: 'LP_AC_PUEBLO_NUEVO', name: 'Pueblo Nuevo' }
          ]
        }
      ]
    },
    {
      id: 'SC',
      name: 'Santa Cruz',
      cities: [
        {
          id: 'SC_SANTA_CRUZ',
          name: 'Santa Cruz de la Sierra',
          districts: [
            { id: 'SC_SC_CENTRO', name: 'Centro' },
            { id: 'SC_SC_PRIMER_ANILLO', name: 'Primer Anillo' },
            { id: 'SC_SC_SEGUNDO_ANILLO', name: 'Segundo Anillo' },
            { id: 'SC_SC_TERCER_ANILLO', name: 'Tercer Anillo' },
            { id: 'SC_SC_CUARTO_ANILLO', name: 'Cuarto Anillo' },
            { id: 'SC_SC_PLAN_3000', name: 'Plan 3000' },
            { id: 'SC_SC_EQUIPETROL', name: 'Equipetrol' },
            { id: 'SC_SC_LAS_PALMAS', name: 'Las Palmas' },
            { id: 'SC_SC_URBARI', name: 'Urbari' },
            { id: 'SC_SC_PAMPA_DE_LA_ISLA', name: 'Pampa de la Isla' }
          ]
        },
        {
          id: 'SC_MONTERO',
          name: 'Montero',
          districts: [
            { id: 'SC_MT_CENTRO', name: 'Centro' },
            { id: 'SC_MT_BARRIO_NUEVO', name: 'Barrio Nuevo' }
          ]
        },
        {
          id: 'SC_WARNES',
          name: 'Warnes',
          districts: [
            { id: 'SC_WR_CENTRO', name: 'Centro' },
            { id: 'SC_WR_VILLA_NUEVA', name: 'Villa Nueva' }
          ]
        }
      ]
    },
    {
      id: 'CB',
      name: 'Cochabamba',
      cities: [
        {
          id: 'CB_COCHABAMBA',
          name: 'Cochabamba',
          districts: [
            { id: 'CB_CB_CENTRO', name: 'Centro' },
            { id: 'CB_CB_NORTE', name: 'Zona Norte' },
            { id: 'CB_CB_SUR', name: 'Zona Sur' },
            { id: 'CB_CB_ESTE', name: 'Zona Este' },
            { id: 'CB_CB_OESTE', name: 'Zona Oeste' },
            { id: 'CB_CB_TEMPORAL', name: 'Temporal' },
            { id: 'CB_CB_SACABA', name: 'Sacaba' }
          ]
        },
        {
          id: 'CB_QUILLACOLLO',
          name: 'Quillacollo',
          districts: [
            { id: 'CB_QU_CENTRO', name: 'Centro' },
            { id: 'CB_QU_VILLA_NUEVA', name: 'Villa Nueva' }
          ]
        }
      ]
    },
    {
      id: 'OR',
      name: 'Oruro',
      cities: [
        {
          id: 'OR_ORURO',
          name: 'Oruro',
          districts: [
            { id: 'OR_OR_CENTRO', name: 'Centro' },
            { id: 'OR_OR_NORTE', name: 'Zona Norte' },
            { id: 'OR_OR_SUR', name: 'Zona Sur' }
          ]
        }
      ]
    },
    {
      id: 'PT',
      name: 'Potosí',
      cities: [
        {
          id: 'PT_POTOSI',
          name: 'Potosí',
          districts: [
            { id: 'PT_PT_CENTRO', name: 'Centro' },
            { id: 'PT_PT_NORTE', name: 'Zona Norte' }
          ]
        }
      ]
    },
    {
      id: 'TJ',
      name: 'Tarija',
      cities: [
        {
          id: 'TJ_TARIJA',
          name: 'Tarija',
          districts: [
            { id: 'TJ_TJ_CENTRO', name: 'Centro' },
            { id: 'TJ_TJ_SAN_LUIS', name: 'San Luis' },
            { id: 'TJ_TJ_LOURDES', name: 'Lourdes' }
          ]
        }
      ]
    },
    {
      id: 'SC_NORTE',
      name: 'Sucre',
      cities: [
        {
          id: 'SC_N_SUCRE',
          name: 'Sucre',
          districts: [
            { id: 'SC_N_SC_CENTRO', name: 'Centro Histórico' },
            { id: 'SC_N_SC_NORTE', name: 'Zona Norte' }
          ]
        }
      ]
    },
    {
      id: 'BE',
      name: 'Beni',
      cities: [
        {
          id: 'BE_TRINIDAD',
          name: 'Trinidad',
          districts: [
            { id: 'BE_TR_CENTRO', name: 'Centro' },
            { id: 'BE_TR_NORTE', name: 'Zona Norte' }
          ]
        }
      ]
    },
    {
      id: 'PD',
      name: 'Pando',
      cities: [
        {
          id: 'PD_COBIJA',
          name: 'Cobija',
          districts: [
            { id: 'PD_CO_CENTRO', name: 'Centro' },
            { id: 'PD_CO_NUEVA', name: 'Zona Nueva' }
          ]
        }
      ]
    }
  ]
};

// Helper functions para obtener datos
export const getDepartments = (): Department[] => {
  return BOLIVIA_DATA.departments;
};

export const getCitiesByDepartment = (departmentId: string): City[] => {
  const department = BOLIVIA_DATA.departments.find(dep => dep.id === departmentId);
  return department?.cities || [];
};

export const getDistrictsByCity = (cityId: string): District[] => {
  for (const department of BOLIVIA_DATA.departments) {
    const city = department.cities.find(city => city.id === cityId);
    if (city) {
      return city.districts;
    }
  }
  return [];
};

export const findDepartmentById = (departmentId: string): Department | undefined => {
  return BOLIVIA_DATA.departments.find(dep => dep.id === departmentId);
};

export const findCityById = (cityId: string): City | undefined => {
  for (const department of BOLIVIA_DATA.departments) {
    const city = department.cities.find(city => city.id === cityId);
    if (city) return city;
  }
  return undefined;
};

export const findDistrictById = (districtId: string): District | undefined => {
  for (const department of BOLIVIA_DATA.departments) {
    for (const city of department.cities) {
      const district = city.districts.find(district => district.id === districtId);
      if (district) return district;
    }
  }
  return undefined;
};

// Obtener información completa de una dirección
export const getFullAddress = (departmentId: string, cityId: string, districtId: string) => {
  const department = findDepartmentById(departmentId);
  const city = findCityById(cityId);
  const district = findDistrictById(districtId);
  
  return {
    country: BOLIVIA_DATA.name,
    countryCode: BOLIVIA_DATA.code,
    stateProvince: department?.name || '',
    city: city?.name || '',
    district: district?.name || '',
    timezone: BOLIVIA_DATA.timezone
  };
};