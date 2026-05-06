import androidx.room.Dao;
import androidx.room.Delete;
import androidx.room.Insert;
import androidx.room.Query;
import androidx.room.Update;
import java.util.List;

@Dao
public interface VacationDao {
    @Insert
    long insert(Vacation vacation);

    @Update
    void update(Vacation vacation);

    @Delete
    void delete(Vacation vacation);

    @Query("SELECT * FROM vacation_table ORDER BY id DESC")
    List<Vacation> getAllVacations();

    @Query("SELECT COUNT(*) FROM excursion_table WHERE vacationId = :vacationId")
    int countExcursions(int vacationId);
}
