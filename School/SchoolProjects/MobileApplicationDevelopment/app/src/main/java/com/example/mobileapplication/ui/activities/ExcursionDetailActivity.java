import android.app.DatePickerDialog;
import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import java.util.Calendar;

public class ExcursionDetailActivity extends AppCompatActivity {
    private EditText editTitle, editDate;
    private AppDatabase db;
    private Excursion excursion;
    private int excursionId, vacationId;
    private String vacationStartDate, vacationEndDate;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_excursion_detail);

        db = AppDatabase.getInstance(this);
        editTitle = findViewById(R.id.editExcursionTitle);
        editDate = findViewById(R.id.editExcursionDate);
        Button btnSave = findViewById(R.id.btnSaveExcursion);
        Button btnDelete = findViewById(R.id.btnDeleteExcursion);

        excursionId = getIntent().getIntExtra("excursion_id", -1);
        vacationId = getIntent().getIntExtra("vacation_id", -1);
        vacationStartDate = getIntent().getStringExtra("vacation_start");
        vacationEndDate = getIntent().getStringExtra("vacation_end");

        if (excursionId != -1) {
            excursion = db.excursionDao().getExcursionById(excursionId);
            editTitle.setText(excursion.getTitle());
            editDate.setText(excursion.getDate());
        }

        editDate.setOnClickListener(v -> showDatePicker());

        btnSave.setOnClickListener(v -> saveExcursion());
        btnDelete.setOnClickListener(v -> deleteExcursion());
    }

    private void showDatePicker() {
        Calendar calendar = Calendar.getInstance();
        new DatePickerDialog(this, (datePicker, year, month, day) -> {
            String selectedDate = year + "-" + (month + 1) + "-" + day;
            editDate.setText(selectedDate);
        }, calendar.get(Calendar.YEAR), calendar.get(Calendar.MONTH), calendar.get(Calendar.DAY_OF_MONTH)).show();
    }

    private void saveExcursion() {
        String title = editTitle.getText().toString().trim();
        String date = editDate.getText().toString().trim();

        if (TextUtils.isEmpty(title) || TextUtils.isEmpty(date)) {
            Toast.makeText(this, "All fields are required!", Toast.LENGTH_SHORT).show();
            return;
        }

        if (!DateUtils.isValidDate(date)) {
            Toast.makeText(this, "Invalid date format!", Toast.LENGTH_SHORT).show();
            return;
        }

        if (!DateUtils.isDateWithinRange(date, vacationStartDate, vacationEndDate)) {
            Toast.makeText(this, "Excursion date must be within vacation dates!", Toast.LENGTH_SHORT).show();
            return;
        }

        if (excursionId == -1) {
            excursion = new Excursion(vacationId, title, date);
            db.excursionDao().insert(excursion);
            Toast.makeText(this, "Excursion Added!", Toast.LENGTH_SHORT).show();
        } else {
            excursion.setTitle(title);
            excursion.setDate(date);
            db.excursionDao().update(excursion);
            Toast.makeText(this, "Excursion Updated!", Toast.LENGTH_SHORT).show();
        }

        NotificationUtils.scheduleExcursionNotification(this, excursionId, date, "Excursion: " + title);
        finish();
    }

    private void deleteExcursion() {
        if (excursion != null) {
            db.excursionDao().delete(excursion);
            Toast.makeText(this, "Excursion Deleted!", Toast.LENGTH_SHORT).show();
            finish();
        }
    }
}
