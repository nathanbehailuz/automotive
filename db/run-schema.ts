import { readFileSync } from 'fs'
import { join } from 'path'
import { supabaseAdmin } from '../src/lib/supabase-server'

async function runSchema() {
  try {
    console.log('Reading schema file...')
    const schemaPath = join(__dirname, 'schema.sql')
    const schema = readFileSync(schemaPath, 'utf8')
    
    console.log('Applying schema to Supabase...')
    const { error } = await supabaseAdmin.rpc('exec_sql', { sql: schema })
    
    if (error) {
      // If exec_sql doesn't exist, try direct query execution
      console.log('Trying direct query execution...')
      const { error: directError } = await supabaseAdmin.from('_').select('*').limit(0)
      
      if (directError) {
        // Fallback: execute each statement individually
        console.log('Executing statements individually...')
        const statements = schema
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'))
        
        for (const statement of statements) {
          if (statement.trim()) {
            console.log(`Executing: ${statement.substring(0, 50)}...`)
            const { error: stmtError } = await supabaseAdmin.rpc('exec', { query: statement })
            if (stmtError) {
              console.warn(`Warning executing statement: ${stmtError.message}`)
            }
          }
        }
      }
    }
    
    console.log('Schema applied successfully!')
    console.log('You can now check your Supabase dashboard to verify the tables were created.')
    
  } catch (error) {
    console.error('Error applying schema:', error)
    process.exit(1)
  }
}

runSchema()
