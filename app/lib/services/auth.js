import { createClient, createSvrClient } from '../supabase'

// Crear el cliente de servicio como parte del objeto authService
export const authService = {
  createServiceClient() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    )
  },

  // Obtener usuario actual
  async getUser() {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Iniciar sesión
  async signIn(email, password) {
    try {
      if (!email || !password) {
        console.error('Missing credentials:', { hasEmail: !!email, hasPassword: !!password })
        throw new Error('Email and password are required')
      }

      const supabase = createClient()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password
      })

      if (error) {
        console.error('Login error details:', { 
          code: error.code,
          message: error.message,
          status: error.status
        })
        throw error
      }

      return data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },

  // Cerrar sesión
  async signOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Suscribirse a cambios de autenticación
  onAuthStateChange(callback) {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback)
    return subscription
  },

  // Obtener suscripción activa del usuario
  async getActiveSubscription(userId = null) {
    try {
      // Usar createClient normal para peticiones del cliente
      const supabase = createClient()
      
      // Si no se proporciona userId, obtenerlo del usuario actual
      if (!userId) {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        if (!user) throw new Error('No authenticated user')
        userId = user.id
      }

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error in getActiveSubscription:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in getActiveSubscription:', error)
      throw error
    }
  },

  // Método específico para el servidor
  async getActiveSubscriptionServer(userId) {
    if (!userId) throw new Error('userId is required for server-side calls')

    const supabase = createSvrClient()

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .single()

    if (error) throw error
    return data
  },

  // Registro de usuario
  async signUp(email, password) {
    const supabase = createClient()
    
    try {
      // Obtener el locale actual de la URL
      const locale = window.location.pathname.split('/')[1] || 'es'
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/${locale}/auth/callback`
        }
      })

      if (authError) throw authError

      return {
        ...authData,
        needsEmailVerification: true
      }
      
    } catch (error) {
      console.error('Error en el proceso de registro:', error)
      throw error
    }
  },

  // Método para crear la suscripción inicial
  async createInitialSubscription(userId) {
    const supabase = createClient()

    try {
      const now = new Date()
      const endDate = new Date(now)
      endDate.setUTCDate(endDate.getUTCDate() + 30)

      const { error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          level: '0',
          active: true,
          start_date: now.toISOString(),
          end_date: endDate.toISOString()
        })

      if (error) {
        console.error('Error creando suscripción:', error)
        throw error
      }
    } catch (error) {
      console.error('Error en el proceso de creación de suscripción:', error)
      throw error
    }
  },

  async cancelSubscription() {
    const supabase = createClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // Primero obtenemos la suscripción activa
      const { data: currentSub, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .limit(1)

      if (fetchError) {
        console.error('Error fetching subscription:', fetchError)
        throw fetchError
      }

      if (!currentSub || currentSub.length === 0) {
        throw new Error('No active subscription found')
      }

      const now = new Date().toISOString()

      // Primero hacemos la actualización
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          cancelled_at: now,
          updated_at: now
        })
        .eq('id', currentSub[0].id)

      if (updateError) {
        console.error('Error updating subscription:', updateError)
        throw updateError
      }

      // Luego obtenemos los datos actualizados
      const { data: updatedSub, error: fetchUpdatedError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('id', currentSub[0].id)
        .single()

      if (fetchUpdatedError) {
        console.error('Error fetching updated subscription:', fetchUpdatedError)
        throw fetchUpdatedError
      }

      return updatedSub

    } catch (error) {
      console.error('Error in cancelSubscription:', error)
      throw error
    }
  },

  async getCurrentUser() {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error getting current user:', error)
      throw error
    }
    
    return user
  },

  async updateSubscription({ 
    userId, 
    stripeCustomerId, 
    stripeSubscriptionId, 
    level, 
    active, 
    startDate, 
    endDate, 
    cancelledAt  // Añadido aquí
  }) {
    
    try {
      const supabase = createSvrClient()
      
      // Primero buscar si existe una suscripción
      const { data: existingSub, error: searchError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()


      if (searchError) {
        console.error('❌ Error searching subscription:', searchError)
        throw searchError
      }

      if (existingSub) {
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: stripeSubscriptionId,
            level,
            active,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            cancelled_at: cancelledAt?.toISOString() || null,  // Añadido aquí
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)

        if (updateError) {
          console.error('❌ Error updating subscription:', updateError)
          throw updateError
        }
      } else {
        const { error: insertError } = await supabase
          .from('user_subscriptions')
          .insert([{
            user_id: userId,
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: stripeSubscriptionId,
            level,
            active,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            cancelled_at: cancelledAt?.toISOString() || null,  // Añadido aquí
            updated_at: new Date().toISOString()
          }])

        if (insertError) {
          console.error('❌ Error inserting subscription:', insertError)
          throw insertError
        }
      }
    } catch (error) {
      console.error('❌ Error in updateSubscription:', error)
      throw error
    }
  },

  async updateSubscriptionStatus({ stripeSubscriptionId, active, endDate }) {
    const supabase = this.createServiceClient()
    
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        active,
        end_date: endDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', stripeSubscriptionId)

    if (error) {
      console.error('Error in updateSubscriptionStatus:', error)
      throw error
    }
  },

  async cancelSubscription(stripeSubscriptionId) {
    try {
      const supabase = createSvrClient()

      const { data: existingSub } = await this.getSubscriptionByStripeId(stripeSubscriptionId)

      if (!existingSub) {
        throw new Error(`No subscription found with id: ${stripeSubscriptionId}`)
      }

      const cancelledAt = new Date()

      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          cancelled_at: cancelledAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', stripeSubscriptionId)

      if (updateError) {
        console.error('❌ Error marking subscription as cancelled:', updateError)
        throw updateError
      }

    } catch (error) {
      console.error('❌ Error in cancelSubscription:', error)
      throw error
    }
  },

  async getSubscriptionByStripeId(stripeSubscriptionId) {
    const supabase = createSvrClient()

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .single()

    if (error) {
      console.error('Error finding subscription:', error)
      throw error
    }

    return { data }
  },

  async getUserRole() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user role:', error)
      return null
    }

    return data
  },

  async updateUserTimezone(timezone) {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // Actualizar el timezone en la tabla user_subscriptions
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ timezone })
        .eq('user_id', user.id)
        .eq('active', true)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating user timezone:', error)
      throw error
    }
  },
} 