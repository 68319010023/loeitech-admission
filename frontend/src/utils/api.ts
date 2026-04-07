const API_BASE_URL = 'http://localhost:3001/api'

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Admission Plan API
  async getAdmissionPlans() {
    return this.request<any[]>('/admin/admission-plan')
  }

  async createAdmissionPlan(data: {
    ap_years: string
    div_id: number
    cur_id: number
    plan_num: number
  }) {
    return this.request<any>('/admin/admission-plan', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateAdmissionPlan(id: number, data: {
    ap_years: string
    div_id: number
    cur_id: number
    plan_num: number
  }) {
    return this.request<any>(`/admin/admission-plan/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteAdmissionPlan(id: number) {
    return this.request<void>(`/admin/admission-plan/${id}`, {
      method: 'DELETE',
    })
  }

  // Expense Detail API
  async getExpenseDetails() {
    return this.request<any[]>('/admin/expense-detail')
  }

  async createExpenseDetail(data: {
    exp_name: string
    exp_detail: string
    exp_img?: string
    cur_id: number
    exp_cost: number
  }) {
    return this.request<any>('/admin/expense-detail', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateExpenseDetail(id: number, data: {
    exp_name: string
    exp_detail: string
    exp_img?: string
    cur_id: number
    exp_cost: number
  }) {
    return this.request<any>(`/admin/expense-detail/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteExpenseDetail(id: number) {
    return this.request<void>(`/admin/expense-detail/${id}`, {
      method: 'DELETE',
    })
  }

  // Curriculum API (for dropdowns)
  async getCurriculums() {
    return this.request<any[]>('/admin/curriculums')
  }

  async createCurriculum(data: {
    cur_name: string
    cur_shortname: string
  }) {
    return this.request<any>('/admin/curriculums', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCurriculum(id: number, data: {
    cur_name: string
    cur_shortname: string
  }) {
    return this.request<any>(`/admin/curriculums/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteCurriculum(id: number) {
    return this.request<void>(`/admin/curriculums/${id}`, {
      method: 'DELETE',
    })
  }

  // Division API (for dropdowns)
  async getDivisions() {
    return this.request<any[]>('/admin/divisions')
  }

  async createDivision(data: {
    div_name: string
    cur_id: number
  }) {
    return this.request<any>('/admin/divisions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateDivision(id: number, data: {
    div_name: string
    cur_id: number
  }) {
    return this.request<any>(`/admin/divisions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteDivision(id: number) {
    return this.request<void>(`/admin/divisions/${id}`, {
      method: 'DELETE',
    })
  }
}

export const apiService = new ApiService()
