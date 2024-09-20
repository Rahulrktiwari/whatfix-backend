import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());

// Supabase client setup
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Route to update form data in Supabase based on ENT_ID
app.put('/update-data', async (req, res) => {
  const { ENT_ID, ...updatedData } = req.body;

  try {
    // Check if the ENT_ID exists in the database
    const { data: existingData, error: fetchError } = await supabase
      .from('whatfix_onboarding_duplicate') // Replace with your table name
      .select('*')
      .eq('ENT_ID', ENT_ID);

    if (fetchError) {
      throw fetchError;
    }

    if (existingData && existingData.length > 0) {
      // Perform an update if ENT_ID exists
      const { data: updateData, error: updateError } = await supabase
        .from('whatfix_onboarding_duplicate') // Replace with your table name
        .update(updatedData)
        .eq('ENT_ID', ENT_ID);

      if (updateError) {
        throw updateError;
      }

      res.json({ message: 'Data updated successfully', data: updateData });
    } else {
      res.status(404).json({ error: 'ENT_ID not found' });
    }
  } catch (error) {
    console.error('Error updating data:', error.message);
    res.status(500).json({ error: 'Failed to update data', details: error.message });
  }
});

// Existing route to submit form data (unchanged)
app.post('/submit-form', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('whatfix_onboarding_duplicate') // Replace with your table name
      .insert([req.body]);

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to submit form', details: error.message });
  }
});

// Existing route to retrieve data (unchanged)
app.get('/get-data', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('whatfix_onboarding_duplicate') // Replace with your table name
      .select('*');

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to retrieve data', details: error.message });
  }
});


app.get('/get-userdata', async (req, res) => {
  const { email, password } = req.query; // Assuming you'll send these via query parameters

  try {
    const { data, error } = await supabase
      .from('onboarding_users') // Replace with your table name
      .select('*')
      .eq('email', email)
      .eq('password', password);

    if (error) {
      throw error;
    }

    if (data.length > 0) {
      res.json({ success: true, message: 'Login successful', user: data[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error fetching user data:', error.message);
    res.status(500).json({ error: 'Failed to fetch user data', details: error.message });
  }
});





const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
