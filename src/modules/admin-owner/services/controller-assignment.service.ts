import { apiClient } from '../../admin-panel/lib/apiClient';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface Persona {
    idPersona: number;
    nombres: string;
    paterno: string;
    materno: string;
    correo: string;
    telefono?: string;
    direccion?: string;
    genero?: string;
    usuario?: {
        correo: string;
    };
}

export interface Controlador {
    idPersonaOpe: number;
    idSede: number;
    codigoEmpleado: string;
    activo: boolean;
    turno: string;
}

export interface CreateControladorDto {
    idPersonaOpe: number;
    idSede: number;
    codigoEmpleado: string;
    activo: boolean;
    turno: string;
}

export interface AssignToVenueDto {
    idPersonaOpe: number;
    idSede: number;
}

export interface Trabaja {
    idPersonaOpe: number;
    idSede: number;
    activo?: boolean;
    asignadoDesde?: Date;
    asignadoHasta?: Date;
    controlador?: {
        idPersonaOpe: number;
        persona?: Persona;
    };
    sede?: {
        idSede: number;
        nombre: string;
    };
}

// ==========================================
// CONTROLLER ASSIGNMENT SERVICE
// ==========================================

class ControllerAssignmentService {
    /**
     * Search for a person by email address
     * GET /personas/correo/:email
     */
    async searchPersonByEmail(email: string): Promise<Persona> {
        const response = await apiClient.get<Persona>(`/personas/correo/${encodeURIComponent(email)}`);
        return response.data;
    }

    /**
     * Check if a person is already a controller
     * GET /controlador/persona/:idPersona
     * Returns controller data or null if not a controller
     */
    async checkIfController(idPersona: number): Promise<Controlador | null> {
        try {
            const response = await apiClient.get<Controlador | null>(`/controlador/persona/${idPersona}`);
            return response.data;
        } catch (error: any) {
            // If 404, person is not a controller, return null
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }

    /**
     * Create a new controller
     * POST /controlador
     */
    async createController(data: CreateControladorDto): Promise<Controlador> {
        const response = await apiClient.post<Controlador>('/controlador', data);
        return response.data;
    }

    /**
     * Assign a controller to work at a specific venue
     * POST /trabaja
     * Automatically reactivates inactive controllers
     */
    async assignToVenue(data: AssignToVenueDto): Promise<Trabaja> {
        const response = await apiClient.post<Trabaja>('/trabaja', data);
        return response.data;
    }

    /**
     * Get all controller-venue assignments
     * GET /trabaja
     */
    async getAllAssignments(): Promise<Trabaja[]> {
        const response = await apiClient.get<Trabaja[]>('/trabaja');
        return response.data;
    }

    /**
     * Remove a controller assignment from a venue
     * DELETE /trabaja/:idPersonaOpe/:idSede
     * Automatically deactivates controller if no other venues assigned
     */
    async removeAssignment(idPersonaOpe: number, idSede: number): Promise<Trabaja> {
        const response = await apiClient.delete<Trabaja>(`/trabaja/${idPersonaOpe}/${idSede}`);
        return response.data;
    }

    /**
     * Complete workflow to assign a person as controller to a venue
     * 1. Search person by email
     * 2. Check if they're a controller (create if not)
     * 3. Assign to venue
     */
    async assignPersonToVenue(
        email: string,
        idSede: number,
        codigoEmpleado?: string,
        turno?: string
    ): Promise<{
        persona: Persona;
        controlador: Controlador;
        assignment: Trabaja;
        wasControllerCreated: boolean;
    }> {
        // Step 1: Search person by email
        const persona = await this.searchPersonByEmail(email);

        // Step 2: Check if person is controller
        let controlador = await this.checkIfController(persona.idPersona);
        let wasControllerCreated = false;

        // Step 2a: Create controller if doesn't exist
        if (!controlador) {
            const createData: CreateControladorDto = {
                idPersonaOpe: persona.idPersona,
                idSede: idSede,
                codigoEmpleado: codigoEmpleado || `CTRL${persona.idPersona}`,
                activo: true,
                turno: turno || 'Mañana',
            };
            controlador = await this.createController(createData);
            wasControllerCreated = true;
        }

        // Step 3: Assign to venue (reactivates if inactive)
        const assignment = await this.assignToVenue({
            idPersonaOpe: persona.idPersona,
            idSede: idSede,
        });

        return {
            persona,
            controlador,
            assignment,
            wasControllerCreated,
        };
    }
}

// Export singleton instance
export const controllerAssignmentService = new ControllerAssignmentService();
