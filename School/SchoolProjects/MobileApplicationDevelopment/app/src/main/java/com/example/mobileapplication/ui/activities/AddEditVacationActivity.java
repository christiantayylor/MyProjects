import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

public class AddEditVacationActivity extends AppCompatActivity {
    private EditText editTitle, editDestination, editHotel, editStartDate, editEndDate;
    private AppDatabase db;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_edit_vacation);

        db = AppDatabase.getInstance(this);
        editTitle = findViewById(R.id.editTitle);
        editDestination = findViewById(R.id.editDestination);
        editHotel = findViewById(R.id.editHotel);
        editStartDate = findViewById(R.id.editStartDate);
        editEndDate = findViewById(R.id.editEndDate);
    }

    public void saveVacation(View view) {
        String title = editTitle.getText().toString().trim();
        String dest = editDestination.getText().toString().trim();
        String hotel = editHotel.getText().toString().trim();
        String start = editStartDate.getText().toString().trim();
        String end = editEndDate.getText().toString().trim();

        if (title.isEmpty() || dest.isEmpty() || hotel.isEmpty() || start.isEmpty() || end.isEmpty()) {
            Toast.makeText(this, "All fields are required!", Toast.LENGTH_SHORT).show();
            return;
        }

        db.vacationDao().insert(new Vacation(title, dest, hotel, start, end));
        Toast.makeText(this, "Vacation Added!", Toast.LENGTH_SHORT).show();
        finish();
    }
}
