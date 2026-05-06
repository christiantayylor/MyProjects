import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        findViewById(R.id.btnViewVacations).setOnClickListener(v -> startActivity(new Intent(this, VacationListActivity.class)));
        findViewById(R.id.btnAddVacation).setOnClickListener(v -> startActivity(new Intent(this, VacationDetailActivity.class)));
    }
}
