import android.app.DatePickerDialog;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import java.util.Calendar;
import java.util.List;

public class ExcursionActivity extends AppCompatActivity {
    private EditText editTitle, editDate;
    private AppDatabase db;
    private int vacationId;
    private RecyclerView recyclerView;
    private ExcursionAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_excursion);

        db = AppDatabase.getInstance(this);
        vacationId = getIntent().getIntExtra("vacation_id", -1);

        editTitle = findViewById(R.id.editExcursionTitle);
        editDate = findViewById(R.id.editExcursionDate);
        recyclerView = findViewById(R.id.recyclerViewExcursions);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));

        loadExcursions();
    }

    public void selectDate(View view) {
        Calendar calendar = Calendar.getInstance();
        new DatePickerDialog(this, (datePicker, year, month, day) -> {
            String selectedDate = year + "-" + (month + 1) + "-" + day;
            editDate.setText(selectedDate);
        }, calendar.get(Calendar.YEAR), calendar.get(Calendar.MONTH), calendar.get(Calendar.DAY_OF_MONTH)).show();
    }

    public void addExcursion(View view) {
        String title = editTitle.getText().toString().trim();
        String date = editDate.getText().toString().trim();

        if (TextUtils.isEmpty(title) || TextUtils.isEmpty(date)) {
            Toast.makeText(this, "All fields are required!", Toast.LENGTH_SHORT).show();
            return;
        }

        db.excursionDao().insert(new Excursion(vacationId, title, date));
        Toast.makeText(this, "Excursion Added!", Toast.LENGTH_SHORT).show();
        editTitle.setText("");
        editDate.setText("");
        loadExcursions();
    }

    private void loadExcursions() {
        List<Excursion> excursions = db.excursionDao().getExcursionsForVacation(vacationId);
        adapter = new ExcursionAdapter(excursions, db);
        recyclerView.setAdapter(adapter);
    }
}
