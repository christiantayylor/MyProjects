import android.app.DatePickerDialog;
import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import java.util.Calendar;

public class VacationDetailActivity extends AppCompatActivity {
    private EditText editTitle, editDestination, editHotel, editStartDate, editEndDate;
    private AppDatabase db;
    private Vacation vacation;
    private int vacationId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_vacation_detail);

        db = AppDatabase.getInstance(this);
        editTitle = findViewById(R.id.editTitle);
        editDestination = findViewById(R.id.editDestination);
        editHotel = findViewById(R.id.editHotel);
        editStartDate = findViewById(R.id.editStartDate);
        editEndDate = findViewById(R.id.editEndDate);

        vacationId = getIntent().getIntExtra("vacation_id", -1);
        if (vacationId != -1) {
            vacation = db.vacationDao().getVacationById(vacationId);
            populateVacationDetails();
        }
    }

    private void populateVacationDetails() {
        editTitle.setText(vacation.getTitle());
        editDestination.setText(vacation.getDestination());
        editHotel.setText(vacation.getHotel());
        editStartDate.setText(vacation.getStartDate());
        editEndDate.setText(vacation.getEndDate());
    }

    public void saveVacation(View view) {
        String title = editTitle.getText().toString().trim();
        String destination = editDestination.getText().toString().trim();
        String hotel = editHotel.getText().toString().trim();
        String startDate = editStartDate.getText().toString().trim();
        String endDate = editEndDate.getText().toString().trim();

        if (TextUtils.isEmpty(title) || TextUtils.isEmpty(destination) || TextUtils.isEmpty(hotel) ||
                TextUtils.isEmpty(startDate) || TextUtils.isEmpty(endDate)) {
            Toast.makeText(this, "All fields are required!", Toast.LENGTH_SHORT).show();
            return;
        }

        if (!DateUtils.isValidDate(startDate) || !DateUtils.isValidDate(endDate)) {
            Toast.makeText(this, "Invalid date format!", Toast.LENGTH_SHORT).show();
            return;
        }

        if (!DateUtils.isEndDateAfterStartDate(startDate, endDate)) {
            Toast.makeText(this, "End date must be after start date!", Toast.LENGTH_SHORT).show();
            return;
        }

        vacation.setTitle(title);
        vacation.setDestination(destination);
        vacation.setHotel(hotel);
        vacation.setStartDate(startDate);
        vacation.setEndDate(endDate);
        db.vacationDao().update(vacation);

        NotificationUtils.scheduleVacationNotification(this, vacationId, startDate, "Your vacation is starting!");
        NotificationUtils.scheduleVacationNotification(this, vacationId, endDate, "Your vacation is ending!");

        Toast.makeText(this, "Vacation updated!", Toast.LENGTH_SHORT).show();
        finish();
    }

    public void deleteVacation(View view) {
        if (db.vacationDao().countExcursions(vacationId) > 0) {
            Toast.makeText(this, "Cannot delete a vacation with excursions!", Toast.LENGTH_SHORT).show();
            return;
        }
        db.vacationDao().delete(vacation);
        Toast.makeText(this, "Vacation deleted!", Toast.LENGTH_SHORT).show();
        finish();
    }

    public void shareVacation(View view) {
        String shareText = "Vacation: " + vacation.getTitle() +
                "\nDestination: " + vacation.getDestination() +
                "\nHotel: " + vacation.getHotel() +
                "\nStart Date: " + vacation.getStartDate() +
                "\nEnd Date: " + vacation.getEndDate();

        Intent shareIntent = new Intent(Intent.ACTION_SEND);
        shareIntent.setType("text/plain");
        shareIntent.putExtra(Intent.EXTRA_TEXT, shareText);
        startActivity(Intent.createChooser(shareIntent, "Share Vacation Details"));
    }
}
