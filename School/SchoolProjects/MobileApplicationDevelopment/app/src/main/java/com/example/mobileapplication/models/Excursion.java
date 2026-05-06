import androidx.room.Entity;
import androidx.room.ForeignKey;
import androidx.room.PrimaryKey;

@Entity(tableName = "excursion_table",
        foreignKeys = @ForeignKey(entity = Vacation.class, parentColumns = "id", childColumns = "vacationId", onDelete = ForeignKey.CASCADE))
public class Excursion {
    @PrimaryKey(autoGenerate = true)
    private int id;
    private int vacationId;
    private String title;
    private String date;

    public Excursion(int vacationId, String title, String date) {
        this.vacationId = vacationId;
        this.title = title;
        this.date = date;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getVacationId() { return vacationId; }
    public String getTitle() { return title; }
    public String getDate() { return date; }
}
